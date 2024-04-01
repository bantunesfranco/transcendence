import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-password-dialog',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordDialogComponent {
  public formControl: FormControl = new FormControl();

  constructor(public dialogRef: MatDialogRef<PasswordDialogComponent>) {}

  close(): void {
    this.dialogRef.close(this.formControl.value);
  }
}
