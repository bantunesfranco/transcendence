import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ChatType } from 'src/app/enums/chat-type.enum';
import { Chat } from 'src/app/interfaces/chat.interface';
import { Message } from 'src/app/interfaces/message.interface';
import { newUser, User } from 'src/app/interfaces/user.interface';
import { ChatService } from 'src/app/services/chat.service';
import { UserService } from 'src/app/services/user.service';

import { io, Socket } from 'socket.io-client';
import { NgForm } from '@angular/forms';
import { PasswordDialogComponent } from './password/password.component';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  of,
  switchMap,
} from 'rxjs';
import { leaveMode } from 'src/app/enums/leave-mode.enum';
import { UserStatus } from 'src/app/enums/user-status.enum';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody: ElementRef;
  @ViewChild('form') form: NgForm;

  currentUser: User;
  targetUser: User | undefined = undefined;

  members: User[] = [];
  messages: any[] = [];
  selectedChat: Chat;
  chats: Chat[];

  // very pretty workaround
  initChat: Partial<Chat> = {
    type: ChatType.PUBLIC,
    ownerId: 0,
    memberList: [],
    adminList: [],
    banList: [],

    messages: [],

    admins: [],
    bans: [],
    members: [],
  };

  initMessages: Partial<Message> = {
    senderId: 0,
    content: '',
  };

  chat$: BehaviorSubject<Chat> = new BehaviorSubject<Chat>(
    this.initChat as Chat
  );

  messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>(
    this.initMessages as Message[]
  );

  chats$: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>(
    this.initChat as Chat[]
  );

  publicChats: Chat[] = [];

  publicChats$: BehaviorSubject<Chat[]> = new BehaviorSubject<Chat[]>(
    this.initChat as Chat[]
  );

  private allChatsSubscription: Subscription;
  private messagesSubscription: Subscription;
  private newMessageSubscription: Subscription;
  private newChatSubscription: Subscription;
  private currMessageSubscription: Subscription;
  private currChatSubscription: Subscription;
  private allPublicChatsSubscription: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private dialogService: MatDialog,
    private router: Router
  ) {}

  /********************************************************************************************
   * WEB SOCKETS
   *******************************************************************************************/

  ngOnInit(): void {
    console.log('ngOnInit'); // ? debug

    this.chatService.connectSocket();

    this.userService.getCurrent().subscribe((me) => {
      this.currentUser = me;
    });

    this.allPublicChatsSubscription = this.chatService
      .getPublicChats()
      .subscribe((chats: Chat[]) => {
        this.publicChats = chats;
        this.publicChats$.next(chats);
      });

    // this.allPublicChatsSubscription = this.publicChats$

    /**
     * All chats for current user
     */
    this.allChatsSubscription = this.chatService
      .getChatsSocket()
      .subscribe((chats: Chat[]) => {
        console.log('[allChatsSubscription] Got socket chats:', chats); // ? debug
        this.chats = chats;
        this.chats$.next(chats);
        // this.chats.forEach((chat: Chat) => {
        //   if (this.selectedChat) {
        //     if (chat.id === this.selectedChat.id) {
        //       this.chat$.next(chat);
        //     }
        //   }
        // });
      });

    /**
     * All messages when opening a specific chat
     */
    this.messagesSubscription = this.chatService
      .getChatMessagesSocket()
      .subscribe((messages: Message[]) => {
        console.log('[messagesSubscription] Got socket messages:', messages); // ? debug
        messages.forEach((message: Message) => {
          const allMessageIds = this.messages.map(
            (message: Message) => message.id
          );
          if (!allMessageIds.includes(message.id)) {
            this.messages.push(message);
          }
        });
      });

    /**
     * New message received
     */
    this.newMessageSubscription = this.chatService
      .getNewMessageSocket()
      .subscribe((message: Message) => {
        console.log(
          '[newMessageSubscription] Got socket new message:',
          message
        ); // ? debug

        const allMessageIds = this.messages.map(
          (message: Message) => message.id
        );
        if (!allMessageIds.includes(message.id)) {
          this.messages.push(message);
        }
      });

    /**
     * New chat created
     */
    this.newChatSubscription = this.chatService
      .getNewChatSocket()
      .subscribe((newChat: Chat) => {
        console.log('[newChatSubscription] Got socket new chat:', newChat); // ? debug
        if (newChat.memberList.includes(this.currentUser.id)) {
          this.chats.push(newChat);
        } else if (newChat.type === ChatType.PUBLIC) {
          this.publicChats.push(newChat);
        }
      });

    /**
     * Current message being sent
     */
    this.currMessageSubscription = this.messages$.subscribe(
      (message: Partial<Message[]>) => {
        // console.log('[currMessageSubscription] messages$:', this.messages$);
        // console.log('[currMessageSubscription] message:', message);
      }
    );

    /**
     * Keeps track of our current active chat
     */
    this.currChatSubscription = this.chat$.subscribe((chat: Chat) => {
      // console.log('[currChatSubscription] chat$:', this.chat$); // ? debug
      // console.log('[currChatSubscription] chat:', chat); // ? debug
    });

    /**
     * Keeps track of our current active chat
     */
    this.allChatsSubscription = this.chats$.subscribe((chats: Chat[]) => {
      // console.log('[allChatsSubscription] this.chats$:', this.chats$); // ? debug
      // console.log('[allChatsSubscription] chats:', chats); // ? debug
      // this.selectedChat = chats[0];
      // console.log('current chat:', this.selectedChat); // ? debug
    });

    this.allPublicChatsSubscription = this.publicChats$.subscribe(
      (chats: Chat[]) => {
        // console.log(chats); // ? debug
      }
    );

    /**
     * Updates the chat upon chat update from backends
     */
    this.currChatSubscription = this.chatService
      .getChatUpdate()
      .subscribe((chat: Chat) => {
        console.log('[currChatSubscription] chat:', chat); // ? debug
        this.chat$.next(chat);
        this.selectedChat = chat; // ? this might break everything => insallah
        console.log('[currChatSubscription] this.chat$:', this.chat$); // ? debug
        console.log(
          '[currChatSubscription] this.selectedChat:',
          this.selectedChat
        ); // ? debug

        const index = this.chats.findIndex((c) => c.id === chat.id);
        if (index !== -1) {
          this.chats[index] = chat;
        }
      });
  }

  unsubscribeAll(subscription: Subscription[]) {
    subscription.forEach((sub) => {
      // console.log('Unsubscribing from:', sub); // ? debug
      if (sub) {
        sub.unsubscribe();
      }
    });

    this.chatService.disconnectSocket();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy!'); // ? debug

    this.chats = [];
    // this.chat = undefined;
    this.messages = [];

    this.unsubscribeAll([
      this.allChatsSubscription,
      this.messagesSubscription,
      this.newMessageSubscription,
      this.newChatSubscription,
      this.currMessageSubscription,
      this.currChatSubscription,
      this.allPublicChatsSubscription,
    ]);

    // console.log(
    //   'userId sub:',
    //   this.userIdSubscription,
    //   ' | chat sub:',
    //   this.chatSubscription,
    //   ' | chats:',
    //   this.chatsSubscription,
    //   ' | msg sub:',
    //   this.messagesSubscription,
    //   ' | new msg sub:',
    //   this.newMessagesSubscription
    // ); // ? debug
  }

  onSubmit() {
    // console.log('onSubmit form value:', this.form.value); // ? debug
    const { message } = this.form.value;
    if (!message) {
      console.error('Empty message!');
      return;
    }
    // console.log('onSubmit message:', message); // ? debug

    const newMessage: Partial<Message> = {
      content: message,
      chatId: this.selectedChat.id,
      senderId: this.currentUser.id,
      sender: this.currentUser,
    };

    this.messages$.next(message);

    if (this.selectedChat.mutedList.includes(this.currentUser.id)) {
      alert('You are muted in this chat');
    } else {
      this.chatService.sendMessageSocket(newMessage);
    }
    this.form.reset();
  }

  openChat(chat: Chat): void {
    if (chat.banList.includes(this.currentUser.id)) {
      alert('You are banned from this chat');
      return;
    }
    if (chat.type === ChatType.PASS_PROTECTED) {
      this.verifyPassword(chat.id).subscribe((isPasswordCorrect) => {
        if (!isPasswordCorrect) {
          this.selectedChat = this.initChat as Chat;
          this.chat$.next(this.selectedChat);
          console.log('Incorrect password');
          return;
        } else {
          this.selectedChat = chat;
          this.chat$.next(chat);
          this.chatService.joinChatSocket(chat.id);
          this.messages = []; // ! needed otherwise messages stack when changing chat
        }
        console.log('Correct password');
      });
    } else {
      this.selectedChat = chat;
      this.chat$.next(chat);
      this.chatService.joinChatSocket(chat.id);
      this.messages = []; // ! needed otherwise messages stack when changing chat
    }
  }

  leaveChat() {
    this.chatService.leaveChatSocket(
      this.currentUser.id,
      this.selectedChat.id,
      leaveMode.LEAVE
    );
  }

  redirectToProfile(senderId: number) {
    if (senderId) {
      this.router.navigate(['/profile', senderId]);
    }
  }

  verifyPassword(chatId: number): Observable<boolean> {
    return this.dialogService
      .open(PasswordDialogComponent)
      .afterClosed()
      .pipe(
        switchMap((password: string): Observable<boolean> => {
          console.log('check password:', password); // ? debug
          if (!password || password === '') {
            alert('Password cannot be empty');
            return of(false);
          }
          return this.chatService.verifyPasswordSocket(chatId, password);
        }),
        catchError((e) => {
          console.error(e);
          return of(false);
        })
      );
  }

  kickOrBanUser(intraName: string, mode: string) {
    if (this.selectedChat.type === ChatType.PRIVATE) {
      this.targetUser = undefined;
      return;
    }

    let userId = this.selectedChat.members.find(
      (user) => user.intraName === intraName
    )?.id;
    // console.log('userId:', userId); // ? debug
    // console.log('selectedChat:', this.selectedChat); // ? debug

    if (userId === undefined) {
      alert('No such user in this chat');
      this.targetUser = undefined;
      return;
    }

    if (
      this.selectedChat.adminList.includes(userId) &&
      this.currentUser.id !== this.selectedChat.ownerId
    ) {
      alert('You cannot kick/ban an admin');
      this.targetUser = undefined;
      return;
    }

    let leaveType: leaveMode;
    switch (mode) {
      case 'kick':
        leaveType = leaveMode.KICK;
        break;
      case 'ban':
        leaveType = leaveMode.BAN;
        break;
      default:
        throw new Error('Invalid leave mode');
    }

    // console.log('userId:', userId); // ? debug
    // console.log('selectedChat:', this.selectedChat); // ? debug
    // console.log('leaveType:', leaveType); // ? debug

    this.chatService.leaveChatSocket(userId, this.selectedChat.id, leaveType);
    this.targetUser = undefined;
  }

  muteUser(username: string) {
    if (this.selectedChat.type === ChatType.PRIVATE) {
      this.targetUser = undefined;
      return;
    }

    let userId = this.selectedChat.members.find(
      (user) => user.intraName === username
    )?.id;
    if (userId === undefined) {
      alert('No such user in this chat');
      this.targetUser = undefined;
      return;
    }
    this.chatService.muteUserSocket(userId, this.selectedChat.id);
    this.targetUser = undefined;
  }

  generateInviteLink() {
    const lobby = Array.from(
      { length: 16 },
      () => Math.random().toString(36)[2]
    ).join('');
    return `/game/${lobby}`;
  }

  sendInvite() {
    const message = this.generateInviteLink();
    const newMessage: Partial<Message> = {
      content: message,
      isLink: true,
      chatId: this.selectedChat.id,
      senderId: this.currentUser.id,
      sender: this.currentUser,
    };
    this.chatService.sendMessageSocket(newMessage);
  }
}
