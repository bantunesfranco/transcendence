import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../interfaces/chat.interface';
import { Message } from '../interfaces/message.interface';
import { leaveMode } from '../enums/leave-mode.enum';
import { User } from '../interfaces/user.interface';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatEndpoint = '/api/chat';
  private messageEndpoint = '/api/message';
  private userEndpoint = 'api/user';
  private socket: Socket;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.initSocketConnection();
  }

  private initSocketConnection() {
    const socketConfig: SocketIoConfig = this.getSocketIoConfig();
    this.socket = new Socket(socketConfig);
    this.socket.on('connect_error', (error: Error) => {
      console.log('Connection error on socket: ', error.message);
      this.router.navigate(['/']);
    });
  }

  private getSocketIoConfig(): SocketIoConfig {
    return {
      url: `${document.location.hostname}:6969/chat`,
      options: {
        transports: ['websocket'],
        withCredentials: true,
      },
    };
  }

  /********************************************************************************************
   * WEB SOCKETS
   *******************************************************************************************/

  getPublicChats(): Observable<Chat[]> {
    const url = this.chatEndpoint + '/public';
    console.log(url);
    return this.http.get<Chat[]>(url);
  }

  sendMessageSocket(message: Partial<Message>) {
    console.log('Sending via WS message:', message); // ? debug
    this.socket.emit('sendMessage', message);
  }

  getNewMessageSocket(): Observable<Message> {
    console.log('Getting new message from WS'); // ? debug
    return this.socket.fromEvent<Message>('newMessage');
  }

  getChatMessagesSocket(): Observable<Message[]> {
    console.log('Getting chat messages from WS'); // ?  debug
    return this.socket.fromEvent<Message[]>('messages');
  }

  getChatsSocket(): Observable<Chat[]> {
    console.log('Getting chats from WS'); // ? debug
    return this.socket.fromEvent<Chat[]>('chats');
  }

  createChatSocket(chat: Partial<Chat>): void {
    console.log('Creating chats from WS'); // ? debug
    this.socket.emit('createChat', chat);
  }

  getNewChatSocket(): Observable<Chat> {
    console.log('Getting new chat from WS'); // ? debug
    return this.socket.fromEvent<Chat>('newChat');
  }

  joinChatSocket(chatId: number): void {
    console.log('Join chat from WS:', chatId); // ? debug
    this.socket.emit('joinChat', chatId);
  }

  leaveChatSocket(userId: number, chatId: number, leaveMode: leaveMode): void {
    console.log('Leave chat from WS:', chatId); // ? debug
    this.socket.emit('leaveChat', { userId, chatId, leaveMode });
  }

  muteUserSocket(userId: number, chatId: number): void {
    console.log('Mute user from WS:', userId); // ? debug
    this.socket.emit('muteUser', { userId, chatId });
  }

  getChatUpdate(): Observable<Chat> {
    console.log('Getting updated chat from WS'); // ? debug
    return this.socket.fromEvent<Chat>('updateChat');
  }

  disconnectSocket() {
    this.socket.disconnect();
  }

  connectSocket() {
    this.socket.connect();
  }

  verifyPasswordSocket(chatId: number, password: string): Observable<boolean> {
    this.socket.emit('verifyPassword', { chatId, password });
    return this.socket.fromEvent<boolean>('verifyPassword');
  }
}
