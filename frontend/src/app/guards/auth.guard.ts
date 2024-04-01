import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.checkAuthentication().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['']);
          return false;
        }
        return true;
      }),
      catchError((error) => this.router.navigate(['/']))
    );
  }
}
