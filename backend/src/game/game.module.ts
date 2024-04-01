import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { EventsGateway } from '../events/events.gateway';
import { MatchMakerService } from 'src/match-maker/match-maker.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRecord } from './game-record/game-record.entity';
import { GameRecordService } from './game-record/game-record.service';
import { GameRecordModule } from './game-record/game-record.module';
import { StatisticModule } from 'src/statistic/statistic.module';
import { StatisticService } from 'src/statistic/statistic.service';

@Module({
  imports: [GameRecordModule, StatisticModule],
  providers: [GameService, MatchMakerService, EventsGateway, GameRecordService],
  exports: [GameRecordService],
})
export class GameModule {}
