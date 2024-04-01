import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
  styleUrls: ['./avatar-upload.component.css'],
})
export class AvatarUploadComponent {
  constructor(private userService: UserService) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.userService.patchAvatar(formData).subscribe({
      next: (response) => {
        console.log('Avatar uploaded successfully', response);
        setTimeout(() => {
          window.location.reload();
        }, 700);
      },
      error: (error) => {
        console.error('Error uploading avatar', error);
      },
    });
  }

  uploadAvatar() {
    const fileInput = document.querySelector(
      'input[type=file]'
    ) as HTMLInputElement;
    // console.log('fileInput:', fileInput); // ? debug
    fileInput.click();
  }
}
