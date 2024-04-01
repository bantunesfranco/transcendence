import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private retried: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes('/api/auth/refresh')) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status == 401 &&
          this.retried == false
        ) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    console.log('retrying');
    this.retried = true;
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const retryReq = req.clone();
        return next.handle(retryReq);
      }),
      catchError((error) => {
        // We should log out user and clear state front and back
        // TODO: clean up cookies and backend data
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }
}
