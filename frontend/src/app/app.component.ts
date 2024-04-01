import { Component, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { Test, TestService } from './services/test.service';
import { Event, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private service: TestService,
    public router: Router,
    private user: UserService,
    private authService: AuthService
  ) { }

  title = 'transcendence';
  backendValue = this.service.getValue();
}
