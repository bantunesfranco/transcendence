import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[];
  currentUserId: number;
  friendList: number[] = [];
  blockList: number[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.currentUserId = this.userService.getId();
    this.fetchUsers();
    this.userService.getCurrent().subscribe((me) => {
      // console.log('I am:', me); // ? debug
      this.friendList = me.friendList;
      this.blockList = me.blockList;
      // console.log('friend:', this.friendList); // ? debug
      // console.log('block:', this.blockList); // ? debug
    });
  }

  fetchUsers() {
    this.userService.getAll().subscribe((data) => {
      this.users = data;
      // console.log('fetched users:', this.users); // ? debug
    });
  }

  addFriend(user: User) {
    this.userService.addFriend(user.id).subscribe((response) => {
      // console.log('Friend added successfully', response); // ? debug
      this.friendList.push(user.id);
      const index = this.blockList.indexOf(user.id);
      if (index !== -1) {
        this.blockList.splice(index, 1);
      }
      this.fetchUsers();
    });
  }

  blockUser(user: User) {
    this.userService.blockUser(user.id).subscribe((response) => {
      // console.log('User blocked successfully', response); // ? debug
      this.blockList.push(user.id);
      const index = this.friendList.indexOf(user.id);
      if (index !== -1) {
        this.friendList.splice(index, 1);
      }
      this.fetchUsers();
    });
  }

  isUserInFriendList(user: User): boolean {
    return this.friendList?.includes(user.id);
  }

  isUserInBlockList(user: User): boolean {
    return this.blockList?.includes(user.id);
  }
}
