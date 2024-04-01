import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user.interface';
import { TwoFaService } from 'src/app/services/two-fa.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  me: boolean = false;
  user: User;
  friends: User[] = [];
  foes: User[] = [];

  constructor(
    private userService: UserService,
    private twoFaService: TwoFaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.paramMap.get('userId');

    if (userIdParam) {
      const userId = parseInt(userIdParam, 10);
      this.userService
        .getCurrent()
        .pipe(
          switchMap((res) => {
            if (userId === res.id) {
              this.me = true;
              return this.userService.getWithMeta();
            } else {
              return this.userService.getOneByIdWithMeta(userId);
            }
          })
        )
        .subscribe((data) => {
          this.user = data;
          this.loadFriendsAndFoes();
        });
    } else {
      this.userService.getWithMeta().subscribe((data) => {
        this.me = true;
        this.user = data;
        console.log('user:', this.user); // ? debug
        this.loadFriendsAndFoes();
      });
    }
  }

  private loadFriendsAndFoes(): void {
    // console.log('user:', this.user); // ? debug
    this.user.friendList.forEach((id) => {
      this.userService.getOneById(id).subscribe((user) => {
        this.friends.push(user);
      });
    });

    this.user.blockList.forEach((id) => {
      this.userService.getOneById(id).subscribe((user) => {
        this.foes.push(user);
      });
    });
  }

  disableTwoFa(): void {
    if (this.me) {
      this.twoFaService.disableTwoFa().subscribe(
        () => {
          this.user.isTwoFactorAuthEnabled = false;
        },
        (error: Error) => {
          console.log('Error while disabling TwoFA', error.message);
        }
      );
    }
  }
}
