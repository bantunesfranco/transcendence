import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwoFaService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  checkAuthentication(): Observable<boolean> {
    return this.http
      .get<{ isAuthenticated: boolean }>('/api/2fa/validate')
      .pipe(
        map((response) => {
          this.isAuthenticated.next(response.isAuthenticated);
          return response.isAuthenticated;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(
            () => new Error(`Error in checkTwoFaAuthentication: ${error.error}`)
          );
        })
      );
  }

  generateQrCode() {
    return this.http.post('/api/2fa/generate', {}, { responseType: 'blob' });
  }

  sendCode(code: string) {
    console.log('Code:', code);
    return this.http.post('/api/2fa/turn-on', {
      code,
    });
  }

  authenticate(code: string): Observable<Object> {
    return this.http.post('/api/2fa/authenticate', { code: code });
  }

  disableTwoFa() {
    return this.http.post('/api/2fa/disable', {});
  }
}
