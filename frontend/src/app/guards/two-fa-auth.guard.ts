import { Injectable } from '@angular/core';
import { TwoFaService } from '../services/two-fa.service';
import { Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwoFaAuthGuard {
  constructor(private twoFaService: TwoFaService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.twoFaService.checkAuthentication().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['']);
          return false;
        }
        return true;
      }),
      catchError((error) => of(false))
    );
  }
}
