import { Module } from '@nestjs/common';
import { GameRecordService } from './game-record.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRecord } from './game-record.entity';
import { GameRecordController } from './game-record.controller';
import { StatisticService } from 'src/statistic/statistic.service';
import { StatisticModule } from 'src/statistic/statistic.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameRecord]),
    UserModule,
    StatisticModule,
  ],
  controllers: [GameRecordController],
  providers: [GameRecordService],
  exports: [TypeOrmModule, GameRecordService],
})
export class GameRecordModule {}
