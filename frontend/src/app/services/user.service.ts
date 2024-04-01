import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, share, tap } from 'rxjs';
import { UserStatus } from 'src/app/enums/user-status.enum';
import { Statistic } from 'src/app/interfaces/statistic.entity';
import { User } from 'src/app/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  private userEndpoint = '/api/user';
  private uploadEndpoint = '/api/upload';
  private id: number;
  private intraName: string;
  currentUser$: Observable<User>;

  /***************************************
   * GET
   ***************************************/

  getAll() {
    return this.http.get<User[]>(this.userEndpoint);
  }

  getAllByIds(ids: number[]) {
    const queryParams = ids.map((id) => `ids=${id}`).join('&');
    const url = `${this.userEndpoint}?${queryParams}`;
    console.log(url);
    return this.http.get<User[]>(url);
  }

  getOneById(userId: number) {
    return this.http.get<User>(this.userEndpoint + '/' + userId);
  }

  getOneByIdWithMeta(userId: number) {
    return this.http.get<User>(this.userEndpoint + '/meta/' + userId);
  }

  getId() {
    return this.id;
  }

  getIntraName() {
    return this.intraName;
  }

  /**
   * Get current user (auth guard)
   */
  getWithMeta() {
    return this.http.get<User>(this.userEndpoint + '/me');
  }

  /**
   * Get meta of current user id
   */
  getWithMetaById() {
    return this.http.get<User>(this.userEndpoint + '/' + this.getId());
  }

  getCurrent(): Observable<User> {
    // const url = this.userEndpoint + '/' + this.id;
    const url = this.userEndpoint + '/me';
    if (!this.currentUser$) {
      this.currentUser$ = this.http.get<User>(url).pipe(share());
    }
    return this.currentUser$;
  }

  getFriends() {
    // return this.http.get < numb;
  }

  /***************************************
   * SET
   ***************************************/

  setId(new_id: number) {
    this.id = new_id;
  }

  setIntraName(newIntraName: string) {
    this.intraName = newIntraName;
  }

  /***************************************
   * POST
   ***************************************/

  addFriend(friendId: number) {
    const url = this.userEndpoint + '/' + this.getId() + '/add-friend';
    // console.log(url); // ? debug
    return this.http.post(url, { friendId });
  }

  blockUser(blockedUserId: number) {
    const url = this.userEndpoint + '/' + this.getId() + '/block-user';
    // console.log(url); // ? debug
    return this.http.post(url, { blockedUserId });
  }

  /***************************************
   * PATCH
   ***************************************/

  patchAvatar(file: FormData) {
    const url = this.uploadEndpoint + '/me';
    console.log(url); // ? debug
    return this.http.patch(url, file);
  }

  update(updateDto: Partial<User>) {
    const url = this.userEndpoint + '/me';
    // console.log('url:', url); // ? debug
    console.log('user:', updateDto); // ? debug
    return this.http.patch(url, updateDto);
  }

  validateUserName(
    userName: string
  ): Observable<{ valid: boolean; message: string }> {
    const url = this.userEndpoint + '/me/validate-username';
    return this.http.patch<{ valid: boolean; message: string }>(url, {
      userName,
    });
  }
}
