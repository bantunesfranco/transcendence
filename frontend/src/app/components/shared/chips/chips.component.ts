import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { UserStatus } from 'src/app/enums/user-status.enum';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.css',
})
export class ChipsComponent implements OnInit {
  @Input() user: { status: UserStatus };
  @Input() readOnlyMode: boolean;
  @Output() statusSelected = new EventEmitter<UserStatus>();
  inputValue: UserStatus;

  ngOnInit(): void {
    this.inputValue = this.user.status;
    // console.log('readOnlyMode:', this.readOnlyMode); // ? debug
  }

  setStatus(status: number): void {
    if (status === 0) {
      this.statusSelected.emit(UserStatus.ONLINE);
    } else {
      this.statusSelected.emit(UserStatus.OFFLINE);
    }
  }
}

/**
 * TODO add logic
 */
