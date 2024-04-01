import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Statistic } from '../interfaces/statistic.entity';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private statEndpoint = '/api/statistic';

  constructor(private http: HttpClient, private userService: UserService) {}

  getStats(): Observable<Statistic> {
    return this.http.get<Statistic>(this.statEndpoint).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get stats of current user (auth guard)
   */
  getWithMeta(): Observable<Statistic> {
    return this.http.get<Statistic>(this.statEndpoint + '/me').pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get stats of current user id
   */
  getByCurrentIdWithMeta(): Observable<Statistic> {
    // console.log(this.userService.getId()); // ? debug
    return this.http
      .get<Statistic>(this.statEndpoint + '/' + this.userService.getId())
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Get stats by stat id
   */
  getByIdWithMeta(id: number): Observable<Statistic> {
    // console.log(this.userService.getId()); // ? debug
    return this.http.get<Statistic>(this.statEndpoint + '/' + id).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
