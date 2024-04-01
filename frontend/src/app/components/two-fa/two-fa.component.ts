import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TwoFaService } from '../../services/two-fa.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-two-fa',
  templateUrl: './two-fa.component.html',
  styleUrl: './two-fa-auth/two-fa-auth.component.css',
})
export class TwoFaComponent implements OnInit, AfterViewInit {
  qrCodeUrl: string | null;
  activationCode: string = '';
  codeForm: FormGroup;

  constructor(private twoFaAuthService: TwoFaService, private router: Router) {
    this.codeForm = new FormGroup({
      one: new FormControl(''),
      two: new FormControl(''),
      three: new FormControl(''),
      four: new FormControl(''),
      five: new FormControl(''),
      six: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.twoFaAuthService.generateQrCode().subscribe((blob: any) => {
      this.qrCodeUrl = URL.createObjectURL(blob);
    });
  }

  ngAfterViewInit(): void {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      '#code-container > *[id]'
    );
    inputs[0].focus();
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('keydown', function (event: any) {
        if (event.key === 'Backspace') {
          if (inputs[i]?.value == '') {
            if (i != 0) {
              inputs[i - 1].focus();
            }
          } else {
            inputs[i].value = '';
          }
        } else if (event.key === 'ArrowLeft' && i !== 0) {
          inputs[i - 1].focus();
        } else if (event.key === 'ArrowRight' && i !== inputs.length - 1) {
          inputs[i + 1].focus();
        } else if (
          event.key != 'ArrowLeft' &&
          event.key != 'ArrowRight' &&
          event.key != 'Enter'
        ) {
          inputs[i].value = '';
        }
      });
      inputs[i].addEventListener('input', (event) => {
        if (!inputs[i].value.search('[^0-9]')) {
          inputs[i].value = '';
          event.preventDefault();
          return false;
        }
        if (i === inputs.length - 1 && inputs[i].value !== '') {
          return true;
        } else if (inputs[i].value !== '') {
          inputs[i + 1].focus();
          return false;
        }
        return false;
      });
    }
  }

  clearField() {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      '#code-container > *[id]'
    );
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].value = '';
    }
    inputs[0].focus();
  }

  setWrong(state: boolean) {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      '#code-container > *[id]'
    );
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].classList.contains('wrong') && state == false) {
        inputs[i].classList.remove('wrong');
      } else if (!inputs[i].classList.contains('wrong') && state == true) {
        inputs[i].classList.add('wrong');
      }
    }
  }

  sendCode() {
    const inputFields = this.codeForm.controls;
    let code = '';
    for (let field in inputFields) {
      if (inputFields[field].value === '') {
        return;
      }
      code += inputFields[field].value;
    }
    this.twoFaAuthService.sendCode(code).subscribe({
      next: (result: any) => {
        this.setWrong(false);
        this.router.navigate(['profile']);
      },
      error: (err) => {
        this.clearField();
        this.setWrong(true);
      },
    });
  }
}
