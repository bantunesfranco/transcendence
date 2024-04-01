import { Component, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-user-friends-foes',
  templateUrl: './user-friends-foes.component.html',
  styleUrl: './user-friends-foes.component.css',
})
export class UserFriendsFoesComponent {
  @Input() friends: User[];
  @Input() foes: User[];
}
