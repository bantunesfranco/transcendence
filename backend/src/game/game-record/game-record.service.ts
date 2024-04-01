import { Injectable } from '@nestjs/common';
import { interval, take } from 'rxjs';
import { GameRecord } from './game-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameRecordDto } from './dto/create-game-record.dto';
import { StatisticService } from 'src/statistic/statistic.service';
import { UpdateStatDto } from 'src/statistic/dto/update-stat.dto';
import { Statistic } from 'src/statistic/statistic.entity';

@Injectable()
export class GameRecordService {
  constructor(
    @InjectRepository(GameRecord)
    private readonly gameRecordRepository: Repository<GameRecord>,
    private readonly statService: StatisticService,
  ) {}

  private prepareUpdateDto(player: Statistic): UpdateStatDto {
    return {
      id: player.id,
      nbWin: player.nbWin,
      nbLoss: player.nbLoss,
      totalGames: player.totalGames,
      totalScore: player.totalScore,
    };
  }

  async updatePlayerStats(dto: CreateGameRecordDto) {
    console.log(
      'Updating stats for player1 id: ' +
        dto.player1Id +
        ' | player2 id: ' +
        dto.player2Id,
    );

    const statPlayer1: Statistic = await this.statService.findByUserId(
      dto.player1Id,
    );
    const statPlayer2: Statistic = await this.statService.findByUserId(
      dto.player2Id,
    );

    if (dto.winnerId === dto.player1Id) {
      statPlayer1.nbWin++;
      statPlayer2.nbLoss++;
    } else {
      statPlayer1.nbLoss++;
      statPlayer2.nbWin++;
    }
    statPlayer1.totalGames++;
    statPlayer2.totalGames++;
    statPlayer1.totalScore += dto.scoreP1;
    statPlayer2.totalScore += dto.scoreP2;

    const updateP1Stats = this.prepareUpdateDto(statPlayer1);
    const updateP2Stats = this.prepareUpdateDto(statPlayer2);

    // console.log('statPlayer1:', statPlayer1); // ? debug
    // console.log('statPlayer2:', statPlayer2); // ? debug
    // console.log('updateP1:', updateP1Stats); // ? debug
    // console.log('updateP2:', updateP2Stats); // ? debug

    const res1 = await this.statService.update(updateP1Stats);
    const res2 = await this.statService.update(updateP2Stats);
    return { res1, res2 };
  }

  async create(dto: CreateGameRecordDto): Promise<GameRecord> {
    console.log('Saving new game record:', dto);
    const { res1, res2 } = await this.updatePlayerStats(dto);
    if (res1.affected === 0 || res2.affected === 0) {
      throw new Error(`Error updating players stats`);
    }
    return await this.gameRecordRepository.save(dto);
  }

  async findAll(): Promise<GameRecord[]> {
    console.log('Getting all game records');
    return this.gameRecordRepository.find();
  }

  async findAllWithMeta(): Promise<GameRecord[]> {
    console.log('Getting all game records with meta data');
    return this.gameRecordRepository
      .createQueryBuilder('gameRecord')
      .leftJoinAndSelect('gameRecord.player1', 'player1')
      .leftJoinAndSelect('gameRecord.player2', 'player2')
      .leftJoinAndSelect('gameRecord.winner', 'winner')
      .getMany();
  }

  async findWithMeta(userId: number): Promise<GameRecord[]> {
    console.log('Getting all game records with meta data for current user');
    return this.gameRecordRepository
      .createQueryBuilder('gameRecord')
      .leftJoinAndSelect('gameRecord.player1', 'player1')
      .leftJoinAndSelect('gameRecord.player2', 'player2')
      .leftJoinAndSelect('gameRecord.winner', 'winner')
      .where('gameRecord.player1 = :userId OR gameRecord.player2 = :userId', {
        userId,
      })
      .getMany();
  }
}
