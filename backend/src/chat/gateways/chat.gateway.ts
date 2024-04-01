import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from '../chat.service';

import { Server, Socket } from 'socket.io';
import { Message } from 'src/message/message.entity';
import { OnModuleInit, Req, UseGuards } from '@nestjs/common';
import { Subscription, catchError, from, of, switchMap, take, tap } from 'rxjs';
import { JwtAuthGuard, JwtTwoFactorGuard, WsJwtGuard } from 'src/auth/guards';
import { User } from 'src/user/user.entity';
import { ActiveChat } from '../active-chat/active-chat.entity';
import { UserAuth, UserAuthWs } from 'src/utilities/user.decorator';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import cookieParser from 'cookie-parser';
import { Chat } from '../chat.entity';
import { leaveMode } from '../enums/leave-mode.enum';

@WebSocketGateway(6969, {
  // cors: { origin: ['http://localhost:4200/chat'] },
  cors: true,
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: any) {
    console.log('ChatGateway initialized');
  }

  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(
      '========================== HANDLE CONNECT ==========================',
      socket.id,
    ); // ? debug
    // console.log('socket:', socket); // ? debug
    const token: string = socket.handshake.headers.cookie;
    if (!token) {
      throw new Error('No token!');
    }
    this.authService.getJwtUser(token).subscribe((user: User) => {
      // console.log('user:', user); // ? debug
      if (!user) {
        console.log('No USER');
        this.handleDisconnect(socket);
      } else {
        socket.data.user = user;
        // console.log('socket.data:', socket.data); // ? debug
        this.getChats(socket, user.id);
        console.log('Adding current socket to activeSockets room');
        socket.join('activeSockets'); // Current socket joins the room 'activeSockets'
      }
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(
      '========================== HANDLE DISCONNECT ==========================',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    socket.leave('activeSockets'); // Current socket leaves the room 'activeSockets'
  }

  /**
   * Gets chats with userId in memberList and emits to the socket.id (current user and userId)
   */
  getChats(socket: Socket, userId: number): Subscription {
    return this.chatService.getChatsForUserId(userId).subscribe((chats) => {
      // console.log('chats:', chats); // ? debug
      this.server.to(socket.id).emit('chats', chats);
    });
  }

  @SubscribeMessage('createChat')
  createChat(@ConnectedSocket() socket: Socket, @MessageBody() chat: Chat) {
    console.log(
      '======== CREATE CHAT ========',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    // console.log('user:', socket.data.user); // ? debug
    // console.log('chat:', chat); // ? debug

    this.chatService
      .createChatSocket(socket.data.user, chat)
      .pipe(take(1))
      .subscribe(() => {
        // console.log('chat:', chat); // ? debug
        socket.broadcast.emit('newChat', chat); // current socket emits the new chat to all connected sockets
        this.getChats(socket, socket.data.user.id);
      });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() newMessage: Message,
  ) {
    console.log(
      '======== HANDLE MESSAGE ========',
      socket.id,
      socket.data.user.intraName,
      newMessage.chatId,
    ); // ? debug
    // console.log('newMessage:', newMessage); // ? debug
    // console.log(socket.data.user);

    /**
     * Check if socket activeChatId is the same as the newMessage chatId
     * 		? return error, or
     * 		? set correct chat
     */
    const activeChatId: number = socket.data.user.activeChatId;
    const activeChat: string = 'activeChat' + activeChatId;
    if (activeChatId !== newMessage.chatId) {
      console.error('Wrong chat!');
    }

    if (!newMessage.content) {
      console.error('Empty message!');
      return of(null);
    }

    if (newMessage.chatId < 1) {
      console.error('Chat id ' + newMessage.chatId + ' does not exist!');
      return of(null);
    }

    if (newMessage.isLink) {
      console.log(
        'Server sending new game invitation to activeChat:',
        activeChat,
      ); // ? debug
      this.server.to(activeChat).emit('newMessage', newMessage);
      return;
    }

    if (newMessage) {
      this.chatService
        .createMessage(newMessage)
        .pipe(take(1))
        .subscribe((message: Message) => {
          // console.log('created message:', message); // ? debug
          // console.log('newMessage:', newMessage); // ? debug
          console.log('Server sending new message to activeChat:', activeChat); // ? debug
          this.server.to(activeChat).emit('newMessage', message);
        });
    }
  }

  @SubscribeMessage('joinChat')
  joinChat(@ConnectedSocket() socket: Socket, @MessageBody() chatId: number) {
    console.log(
      '======== JOIN CHAT ========',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    // console.log('chatId', chatId); // ? debug

    /**
     * Socket leaves previous chat
     */
    const previousChat: string = 'activeChat' + socket.data.user.activeChatId;
    socket.leave(previousChat);
    console.log('Socket leaving previous activeChat:', previousChat); // ? debug

    /**
     * Check if user is banned from chat
     */
    this.chatService
      .getChat(chatId, socket.data.user.id)
      .pipe(take(1))
      .subscribe((chat: Chat) => {
        // console.log('chat:', chat); // ? debug
        if (chat) {
          if (chat.banList.includes(socket.data.user.id)) {
            console.log('User is banned from chat!');
            return;
          }
        } else {
          console.error('Chat does not exist or user is not a member!');
          return;
        }
      });

    /**
     * Set socket new active chat and join active chat
     */
    socket.data.user.activeChatId = chatId;
    const activeChat: string = 'activeChat' + chatId;
    console.log('Socket joining activeChat:', activeChat); // ? debug
    socket.join(activeChat); // Current socket joins the room 'activeChat + chatId'

    this.chatService
      .getMessages(chatId)
      .pipe(take(1))
      .subscribe((messages: Message[]) => {
        // console.log('joinChat messages:', messages); // ? debug
        // this.server.to(activeChat).emit('messages', messages);
        console.log('Server sending chat messages to socket.id:', socket.id); // ? debug
        this.server.to(socket.id).emit('messages', messages); // ? we only want to get the messages of the chat for the user joining
      });
  }

  @SubscribeMessage('leaveChat')
  async leaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    dto: { userId: number; chatId: number; leaveMode: leaveMode },
  ) {
    console.log(
      '======== LEAVE CHAT ========',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    // console.log('socket data user:', socket.data.user); // ? debug
    console.log('dto:', dto); // ? debug

    const currentChat = 'activeChat' + socket.data.user.activeChatId;
    if (socket.data.user.activeChatId !== dto.chatId) {
      console.error('Wrong chat buddy!');
    }
    const activeChat: string = 'activeChat' + dto.chatId;
    console.log('Socket leaving activeChat:', activeChat); // ? debug
    socket.leave(activeChat); // Current socket joins the room 'activeChat + chatId'

    this.chatService
      .leaveChat(socket.data.user.id, dto)
      .pipe(take(1))
      .subscribe({
        next: (chat: Chat) => {
          // console.log('chat:', chat); // ? debug
          // console.log(activeChat);
          // socket.broadcast.emit('updateChat', chat); // Emits the updated chat to the activeChat room
          this.server.to('activeChat' + dto.chatId).emit('updateChat', chat); // ! works
          this.getChats(socket, socket.data.user.id); // ! works
          // this.server.to('activeSockets').emit('chats');
        },
        error: (e) => {
          console.error(e);
        },
      });
  }

  @SubscribeMessage('muteUser')
  muteUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: { userId: number; chatId: number },
  ) {
    console.log(
      '======== MUTE USER ========',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    // console.log('dto:', dto); // ? debug

    const currentChat = 'activeChat' + socket.data.user.activeChatId;
    if (socket.data.user.activeChatId !== dto.chatId) {
      console.error('Wrong chat buddy!');
    }
    const activeChat: string = 'activeChat' + dto.chatId;
    console.log('Socket leaving activeChat:', activeChat); // ? debug

    this.chatService
      .muteUser(socket.data.user.id, dto)
      .pipe(take(1))
      .subscribe((chat: Chat) => {
        // console.log('chat:', chat); // ? debug
        this.server.to('activeChat' + dto.chatId).emit('updateChat', chat);
      });
  }

  @SubscribeMessage('verifyPassword')
  verifyPassword(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: { chatId: number; password: string },
  ) {
    console.log(
      '======== VERIFY PASSWORD ========',
      socket.id,
      socket.data.user.intraName,
    ); // ? debug
    // console.log('dto:', dto); // ? debug
    this.chatService
      .verifyPassword(dto.chatId, dto.password)
      .then((res: boolean) => {
        // console.log('res:', res);
        this.server.to(socket.id).emit('verifyPassword', res);
      });
  }
}
