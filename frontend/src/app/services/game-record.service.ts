import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameRecord } from '../interfaces/game-record.interface';

@Injectable({
  providedIn: 'root',
})
export class GameRecordService {
  constructor(private http: HttpClient) {}

  private gameRecordEndpoint = '/api/game-record';

  getAll() {
    // console.log(`Getting all users`);
    return this.http.get<GameRecord[]>(this.gameRecordEndpoint);
  }

  getWithMeta() {
    console.log(`Getting all game records with meta data`);
    return this.http.get<GameRecord[]>(this.gameRecordEndpoint + '/me');
  }
}

// TODO only fetch game records of current user
