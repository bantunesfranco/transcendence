import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Profile } from 'passport';
import { User } from 'src/user/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UserService } from 'src/user/user.service';
import { ChatType } from './enums/chat-type.enum';
import * as crypto from 'crypto';

import { leaveMode } from 'src/chat/enums/leave-mode.enum';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ActiveChat } from './active-chat/active-chat.entity';
import { Message } from 'src/message/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private readonly userService: UserService,
    private configService: ConfigService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private hashPassword(password: string) {
    const salt = this.configService.getOrThrow('SALT');
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
  }

  async findById(chatId: number) {
    return this.chatRepository.findOneBy({ id: chatId });
  }

  async verifyPassword(chatId: number, password: string) {
    console.log('chatId: ' + chatId + ' | password: ' + password); // ? debug
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    console.log('chat:', chat); // ? debug
    if (chat) {
      return this.hashPassword(password) === chat.password;
    }
    throw new Error(`ChatId ${chatId} not found`);
  }

  /********************************************************************************************
   * WEB SOCKETS
   *******************************************************************************************/

  findPublicChats(userId: number) {
    console.log('[findPublicChats] userId:', userId); // ? debug

    return from(
      this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.messages', 'message')
        .leftJoinAndSelect('chat.members', 'member')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoin('chat.admins', 'admin')
        .where(':id != chat.ownerId', { id: userId })
        .andWhere('chat.type = :type', { type: ChatType.PUBLIC })
        .andWhere('member.id != :userId', { userId: userId })
        .andWhere('admin.id != :userId', { userId: userId })
        .orderBy('chat.updatedAt', 'DESC')
        .getMany(),
    );
  }

  getChat(ownerId: number, chatId: number): Observable<Chat | undefined> {
    // console.log('getChat:', chatId); // ? debug
    return from(this.chatRepository.findOneBy({ id: chatId }));
  }

  getChatWithMeta(
    ownerId: number,
    chatId: number,
  ): Observable<Chat | undefined> {
    // console.log('getChat:', chatId); // ? debug
    return from(
      this.chatRepository.findOne({
        relations: {
          members: true,
          admins: true,
          muted: true,
        },
        where: {
          id: chatId,
        },
      }),
    );
  }

  getUser(userId: number): Observable<User | undefined> {
    // console.log('getChat:', chatId); // ? debug
    return from(this.userService.findById(userId));
  }

  createChatSocket(owner: User, chat: Chat): Observable<Chat> {
    console.log('Creating chat socket:', owner, chat); // ? debug
    if (!chat.id) {
      console.log('No chat id, creating new chat');
      chat.password = this.hashPassword(chat.password);

      // Create an array of observables for getting each user
      const getUserObservables: Observable<User>[] = chat.memberList.map(
        (userId) => this.getUser(userId),
      );

      const getAdminObservables: Observable<User>[] = chat.adminList.map(
        (userId) => this.getUser(userId),
      );

      return forkJoin(getAdminObservables).pipe(
        switchMap((admins: User[]) => {
          // Assign admins to chat.admins
          chat.admins = admins;

          // Use forkJoin to execute all getUserObservables observables in parallel
          return forkJoin(getUserObservables).pipe(
            switchMap((members: User[]) => {
              // Assign members to chat.members
              chat.members = members;

              // Save the chat object with populated admins and members arrays
              return from(this.chatRepository.save(chat));
            }),
          );
        }),
      );
    } else {
      // TODO is this actually being called once?
      console.log('Found chat id:', chat.id);
      throw new Error('Chat already exists');
    }
  }

  getChatsForUserId(userId: number): Observable<Chat[]> {
    console.log('[getChatsForUserId] userId:', userId); // ? debug
    return from(
      this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.messages', 'message')
        .leftJoinAndSelect('chat.members', 'member')
        .leftJoinAndSelect('message.sender', 'sender')
        .where(':id = ANY(chat.memberList)', { id: userId })
        .orWhere(':id = chat.ownerId', { id: userId })
        .orderBy('chat.updatedAt', 'DESC')
        .getMany(),
    );
  }

  getUsersInChat(chatId: number): Observable<Chat[]> {
    return from(
      this.chatRepository
        .createQueryBuilder('chat')
        .innerJoinAndSelect('chat.members', 'member')
        .innerJoinAndSelect('chat.messages', 'message')
        .where('chat.id = :chatId', { chatId })
        .getMany(),
    );
  }

  getChatsWithUsers(userId: number): Observable<Chat[]> {
    console.log('getChatsWithUsers userId:', userId); // ? debug
    return this.getChatsForUserId(userId).pipe(
      take(1),
      switchMap((chats: Chat[]) => chats),
      mergeMap((chat: Chat) => {
        return this.getUsersInChat(chat.id);
      }),
    );
  }

  leaveChat(
    adminId: number,
    dto: { userId: number; chatId: number; leaveMode: leaveMode },
  ): Observable<any> {
    // console.log('leaveChat socketId:', socketId); // ? debug
    console.log(dto); // ? debug

    return from(
      this.getChatWithMeta(adminId, dto.chatId).pipe(
        take(1),
        switchMap((chat: Chat) => {
          // console.log('found chat:', chat); // ? debug
          // console.log(dto.leaveMode);
          // console.log(dto);

          // Error check
          if (!chat) {
            throw new Error(`Could not find chatId [${dto.chatId}]`);
          }

          // Check if the adminId is in the adminList or is the owner
          if (
            !chat.adminList.includes(adminId) &&
            dto.leaveMode !== leaveMode.LEAVE
          ) {
            throw new Error(
              `UserId ${adminId} is not an admin of chatId ${chat.id}`,
            );
          }

          if (dto.leaveMode !== leaveMode.LEAVE) {
            if (
              chat.adminList.includes(dto.userId) &&
              adminId !== chat.ownerId
            ) {
              console.log('Only the owner can remove an admin');
              return;
            }
          }

          console.log('left chat because: ', dto.leaveMode); // ? debug
          if (dto.leaveMode === leaveMode.BAN) {
            chat.banList.push(dto.userId);
            if (!chat.bans) {
              chat.bans = [
                chat.members.find((member) => member.id === dto.userId),
              ];
            } else {
              chat.bans.push(
                chat.members.find((member) => member.id === dto.userId),
              );
            }
          }

          // console.log(chat);
          // Remove dto.userId from adminList
          if (chat.adminList.includes(dto.userId)) {
            chat.adminList = chat.adminList.filter((id) => id !== dto.userId);
            chat.admins = chat.admins.filter(
              (member) => member.id !== dto.userId,
            );
          }

          // Remove dto.userId from memberList
          if (chat.memberList.includes(dto.userId)) {
            chat.memberList = chat.memberList.filter((id) => id !== dto.userId);
            chat.members = chat.members.filter(
              (member) => member.id !== dto.userId,
            );
          }

          if (chat.ownerId === adminId) {
            if (chat.memberList.length > 0) {
              // Take the first admin in the list else take the first member
              chat.ownerId =
                chat.adminList.length > 0
                  ? chat.adminList[0]
                  : chat.memberList[0];
              chat.owner =
                chat.adminList.length > 0 ? chat.admins[0] : chat.members[0];

              if (!chat.adminList.includes(chat.ownerId)) {
                chat.adminList.push(chat.ownerId);
                chat.admins.push(chat.owner);
              }
            } else {
              // If no other members, delete the chat
              return from(this.chatRepository.delete(dto.chatId));
            }
          }

          // Save the updated chat
          return from(this.chatRepository.save(chat));
        }),
      ),
    );
  }

  muteUser(
    adminId: number,
    dto: { userId: number; chatId: number },
  ): Observable<any> {
    return from(
      this.getChatWithMeta(adminId, dto.chatId).pipe(
        take(1),
        switchMap((chat: Chat) => {
          console.log('found chat:', chat); // ? debug

          // Error check
          if (!chat) {
            throw new Error(`Could not find chatId [${dto.chatId}]`);
          }

          // Check if the adminId is in the adminList or is the owner
          if (!chat.adminList.includes(adminId)) {
            throw new Error(
              `UserId ${adminId} is not an admin of chatId ${chat.id}`,
            );
          }

          if (chat.adminList.includes(dto.userId) && adminId !== chat.ownerId) {
            console.log('Only the owner can mute an admin');
            return;
          }

          // Remove dto.userId from adminList
          if (chat.mutedList.includes(dto.userId)) {
            console.log('enters');
            chat.mutedList = chat.mutedList.filter((id) => id !== dto.userId);
            chat.muted = chat.muted.filter(
              (member) => member.id !== dto.userId,
            );
          } else {
            // Add dto.userId to mutedList
            // console.log(chat);
            if (!chat.muted) {
              chat.mutedList = [dto.userId];
              chat.muted = [
                chat.members.find((member) => member.id === dto.userId),
              ];
            } else {
              chat.mutedList.push(dto.userId);
              chat.muted.push(
                chat.members.find((member) => member.id === dto.userId),
              );
            }
          }

          // Save the updated chat
          return from(this.chatRepository.save(chat));
        }),
      ),
    );
  }

  createMessage(message: Message): Observable<Message> {
    try {
      const now = new Date();
      let chat = this.chatRepository.findOneBy({ id: message.chatId });
      if (!chat) {
        throw new Error(
          `'Could not find any chat for chatId: [${message.chatId}]`,
        );
      }
      this.chatRepository.update(message.chatId, { updatedAt: now }); // ? updates the updatedAt column in the chat entry
      return from(this.messageRepository.save(message));
    } catch (error) {
      console.error('Error creating/saving message:', error);
      throw new Error(error);
    }
  }

  getMessages(chatId: number): Observable<Message[]> {
    // console.log('getMessages activeChatId:', chatId); // ? debug
    return from(
      this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect('message.sender', 'sender')
        .where('message.chatId =:chatId', { chatId })
        .orderBy('message.createdAt', 'ASC')
        .getMany(),
    );
  }
}
