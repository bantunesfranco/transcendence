import { BaseEntity } from 'src/shared/entity-base';
import { User } from 'src/user/user.entity';
import { AfterLoad, Column, Entity, OneToOne } from 'typeorm';
import { CrudValidationGroups } from '@nestjsx/crud';
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  IsEmail,
} from 'class-validator';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Statistic extends BaseEntity {
  @IsOptional({ groups: [CREATE] })
  @IsNotEmpty({ groups: [UPDATE] })
  @Column({ nullable: true })
  userId: number;

  @IsNotEmpty({ groups: [UPDATE] })
  @Column({ default: 0 })
  nbWin: number;

  @IsNotEmpty({ groups: [UPDATE] })
  @Column({ default: 0 })
  nbLoss: number;

  @Column({ default: 0 })
  totalScore: number;

  @Column({ default: 0 })
  totalGames: number;

  /* Calculated */

  ratio: number;
  averageScore: number;

  @AfterLoad()
  getRatio() {
    if (this.nbLoss === 0) {
      this.ratio = this.nbWin;
    } else {
      this.ratio = this.nbWin / this.nbLoss;
    }
  }

  @AfterLoad()
  getAvgScore() {
    if (this.totalGames === 0) {
      this.averageScore = this.totalScore;
    } else {
      this.averageScore = this.totalScore / this.totalGames;
    }
  }

  /* Relations */

  @OneToOne(() => User, (user: User) => user.statistics)
  user: User;
}
