import { Component, OnInit } from '@angular/core';
import { GameRecord } from 'src/app/interfaces/game-record.interface';
import { User } from 'src/app/interfaces/user.interface';
import { GameRecordService } from 'src/app/services/game-record.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-match-history',
  templateUrl: './match-history.component.html',
  styleUrls: ['./match-history.component.css'],
})
export class MatchHistoryComponent implements OnInit {
  games: GameRecord[];

  constructor(private gameRecordService: GameRecordService) {}

  ngOnInit(): void {
    this.gameRecordService.getWithMeta().subscribe((data) => {
      this.games = data;
      console.log(this.games);
    });
  }
}
