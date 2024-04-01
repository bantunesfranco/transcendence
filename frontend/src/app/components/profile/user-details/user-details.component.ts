import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserStatus } from 'src/app/enums/user-status.enum';
import { User } from 'src/app/interfaces/user.interface';
import { TwoFaService } from 'src/app/services/two-fa.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent implements OnInit {
  @Input() user: User;
  @Input() readOnlyMode: boolean;
  @Output() saveClick: EventEmitter<string> = new EventEmitter<string>();
  @Output() statusSelected: EventEmitter<string> = new EventEmitter<string>();

  userNameForm: FormGroup;
  isTwoFAEnabled: boolean;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private twoFaService: TwoFaService
  ) {}

  ngOnInit(): void {
    // console.log('readOnlyMode:', this.readOnlyMode); // ? debug
    console.log('user:', this.user); // ? debug
    this.userNameForm = this.formBuilder.group({
      userName: [
        this.user.userName,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          Validators.pattern(/^[a-zA-Z0-9]+$/),
        ],
      ],
    });
  }

  submitUserName() {
    if (this.userNameForm.valid) {
      const userName = this.userNameForm.value.userName;
      this.userService.validateUserName(userName).subscribe((response) => {
        if (!response.valid) {
          // console.log('invalid user name'); // ? debug
          this.userNameForm.get('userName')?.setErrors({ notUnique: true });
        } else {
          console.log('Saved new user name:', userName); // ? debug
        }
      });
    }
  }

  updateStatus(newStatus: UserStatus): void {
    console.log(this.user);
    this.user.status = newStatus;
    this.userService.update({ status: newStatus }).subscribe({
      // this.userService.updateStatus(newStatus).subscribe({
      next: (res) => {
        // console.log('res:', res); // ? debug
      },
      error: (e) => console.error('Error updateStatus:', e),
      // complete: () => console.info('Completed updating user status'), // ? debug
    });
  }

  updateUserName(newUserName: string): void {
    // console.log('[user-details] update user name:', newUserName); // ? debug
    this.user.userName = newUserName;
    this.userService.update({ userName: newUserName }).subscribe({
      next: (res) => {
        // console.log('res:', res); // ? debug
      },
      error: (e) => console.error(e),
      // complete: () => console.info('Completed updating user display name'), // ? debug
    });
  }

  disableTwoFa() {
    this.twoFaService.disableTwoFa().subscribe((response) => {
      this.isTwoFAEnabled = false;
      window.location.reload();
    }),
      (error: Error) => {
        console.log('Error while disabling TwoFA', error.message);
      };
  }
}
