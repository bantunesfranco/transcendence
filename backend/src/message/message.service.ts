import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Profile } from 'passport';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  async saveMessage(user: IUserJwt, message: CreateMessageDto) {
    // console.log('User:', user); // ? debug
    // console.log('message:', message); // ? debug

    const sender = await this.userService.findById(user.id);
    if (!sender) {
      throw new Error(`Finding userId ${user.id}`);
    }

    const chat = await this.chatService.findById(message.chatId);
    if (!chat) {
      throw new Error(`Finding chatId ${message.chatId}`);
    }
    // TODO: Implement database for muted users
    // if (sender.id in chat.muted)
    // {
    //   console.log('User is muted:', sender.id); // ? debug
    //   return;
    // }

    const newMsg = new Message();
    newMsg.chat = chat;
    newMsg.chatId = message.chatId;
    newMsg.content = message.content;
    newMsg.senderId = message.senderId;
    newMsg.sender = sender;


    // console.log('newMsg:', newMsg);

    return await this.messageRepository.save(newMsg);
  }
}
