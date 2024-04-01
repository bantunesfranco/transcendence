import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';
import { ChatService } from 'src/app/services/chat.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ChatType } from 'src/app/enums/chat-type.enum';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.css'],
})
export class NewChatComponent implements OnInit {
  selectedItem: string;
  checkedItems: Boolean[] = [];
  selectedFriends: User[] = [];
  userIds: number[] = [];

  passwordFormControl: FormControl = new FormControl('');
  chatForm: FormGroup;

  currentUser: User;
  currentUserId: number;

  friends: User[];

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.chatForm = this.fb.group({
      selectedItem: ['0', Validators.required],
      passwordFormControl: ['', Validators.required],
    });

    this.userService.getCurrent().subscribe((me) => {
      this.currentUser = me;
      this.currentUserId = me.id;
      // console.log('me:', this.currentUserId); // ? debug
      // console.log('me:', this.currentUser); // ? debug
      this.userIds.push(me.id);
      let memb: User[] = [];
      this.currentUser.friendList.forEach((userId) => {
        this.userService.getOneById(userId).subscribe((user) => {
          memb.push(user);
        });
      });
      this.friends = memb;
      // console.log('friends:', this.friends); // ? debug
    });
  }

  checkPassword(password: string) {
    const chatType = this.getChatType(this.selectedItem);
    console.log('chat type: ', this.selectedItem);
    if (password === '' && chatType === ChatType.PASS_PROTECTED) {
      alert('Password cannot be empty');
      return false;
    }
    if (
      password !== '' &&
      (chatType === ChatType.PUBLIC || chatType === ChatType.PRIVATE)
    ) {
      alert(`Password is only required for password protected chat`);
      return false;
    }
    // TODO: decide on password requirements
    // if (password.length < 8) {
    //   alert('Password must be at least 8 characters long');
    //   return false;
    // }
    // if (password.search(/[a-z]/) < 0) {
    //   alert('Password must contain at least one lowercase letter');
    //   return false;
    // }
    // if (password.search(/[A-Z]/) < 0) {
    //   alert('Password must contain at least one uppercase letter');
    //   return false;
    // }
    // if (password.search(/[0-9]/) < 0) {
    //   alert('Password must contain at least one digit');
    //   return false;
    // }
    // if (password.search(/[!@#$%^&*]/) < 0) {
    //   alert('Password must contain at least one special character');
    //   return false;
    // }
    return true;
  }

  createChat(event: any) {
    console.log('new chat', event);
    if (this.checkPassword(this.passwordFormControl.value) === false) return;
    const newChat = {
      ownerId: this.currentUser.id,
      type: this.getChatType(this.selectedItem),
      memberList: this.selectedFriends.map((user) => user.id).sort(),
      adminList: this.userIds,
      password: this.passwordFormControl.value,
    };

    newChat.memberList.push(this.currentUserId);
    newChat.memberList.sort();

    this.chatService.createChatSocket(newChat);
    this.router.navigateByUrl('/chat');
  }

  toggleChange(userId: number, event: any) {
    // console.log('userId:', userId); // ? debug
    // console.log('toggleChange event:', event); // ? debug

    const index = this.userIds.indexOf(userId);
    const checked: boolean = event.checked;
    if (checked && index === -1) {
      this.userIds.push(userId);
    } else if (!checked && index !== -1) {
      this.userIds.splice(index, 1);
    }
    // console.log('check: ', checked, this.userIds); // ? debug
  }

  onSelectFriend(event: MatSelectChange) {
    this.selectedFriends = event.value;
  }

  private getChatType(selectedItem: string): ChatType {
    switch (selectedItem) {
      case '0':
        return ChatType.PUBLIC;
      case '1':
        return ChatType.PRIVATE;
      case '2':
        return ChatType.PASS_PROTECTED;
    }
    throw new Error('Invalid chat type');
  }
}
