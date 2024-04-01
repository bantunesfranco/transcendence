import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private authEndpoint = 'api/auth/';

  constructor(
    private http: HttpClient,
    private userService: UserService,
    public router: Router
  ) {}

  checkAuthentication(): Observable<boolean> {
    return this.http
      .get<{ isAuthenticated: boolean; user: any }>(
        this.authEndpoint + 'validate'
      )
      .pipe(
        map((response) => {
          this.isAuthenticated.next(response.isAuthenticated);
          this.userService.setId(response.user.id);
          this.userService.setIntraName(response.user.intraName);
          return response.isAuthenticated;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error while validating!');
          return throwError(
            () => new Error(`Error in checkAuthentication: ${error.error}`)
          );
        })
      );
  }

  refreshToken(): Observable<any> {
    return this.http.get(this.authEndpoint + 'refresh');
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  logout() {
    this.http.post(this.authEndpoint + 'logout', {}).subscribe({
      next: (response) => {
        console.log('Logged out successfully', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      },
    });
  }
}
