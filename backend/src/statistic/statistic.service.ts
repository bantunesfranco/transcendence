import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Statistic } from './statistic.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Profile } from 'passport';
import { User } from 'src/user/user.entity';
import { UpdateStatDto } from './dto/update-stat.dto';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Statistic)
    private statRepository: Repository<Statistic>,
  ) {}

  async create(intraName: string): Promise<Statistic> {
    console.log(`Creating statistics entry for user: [${intraName}]`);
    const newStat = this.statRepository.create();
    return await this.statRepository.save(newStat);
  }

  async update(dto: UpdateStatDto): Promise<UpdateResult> {
    console.log(
      'Updating stats id: ' + dto.id + ' | userId: ' + dto.userId + ' | dto:',
      dto,
    );
    const statToUpdate = this.findById(dto.id);
    if (!statToUpdate) {
      throw new NotFoundException('Statistic id: ' + dto.id + ' not found');
    }
    const result = await this.statRepository.update(dto.id, dto);
    if (result.affected === 0) {
      throw new NotFoundException('Statistic id: ' + dto.id + ' not found');
    }
    return result;
  }

  /**
   * Find by statistic id
   * @param id Id of the stat to find
   * @returns
   */
  async findById(id: number): Promise<Statistic> {
    return this.statRepository.findOneBy({ id: id });
  }

  async findByUserId(id: number) {
    return this.statRepository.findOneBy({ userId: id });
  }

  async findOneByUserIdWithMeta(userId: number) {
    console.log('Finding one by userId with meta: ' + userId);
    return this.statRepository
      .createQueryBuilder('statistic')
      .leftJoinAndSelect('statistic.user', 'user')
      .where('statistic.userId = :userId', { userId })
      .getOne();
  }

  // Uses the current user (JwtAuthGuard)
  async findOneByIdWithMeta(id: number) {
    // console.log('[StatService] Finding one by id with meta: ' + id); // ? debug
    return this.statRepository
      .createQueryBuilder('statistic')
      .leftJoinAndSelect('statistic.user', 'user')
      .where('statistic.id = :id', { id })
      .getOne();
  }

  async testFunc() {
    const users = await this.statRepository.find({
      relations: {
        user: true,
      },
    });
  }

  async remove(id: number): Promise<DeleteResult> {
    console.log('Deleting stat id: ' + id);
    return this.statRepository.delete(id);
  }
}
