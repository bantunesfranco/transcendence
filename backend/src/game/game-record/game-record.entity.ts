import { BaseEntity } from 'src/shared/entity-base';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
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
export class GameRecord extends BaseEntity {
  @IsNotEmpty({ groups: [CREATE, UPDATE] })
  @IsNumber({}, { always: true })
  @Column()
  player1Id: number;

  @IsNotEmpty({ groups: [CREATE, UPDATE] })
  @IsNumber({}, { always: true })
  @Column()
  player2Id: number;

  @IsNotEmpty({ groups: [CREATE, UPDATE] })
  @IsNumber({}, { always: true })
  @Column({ default: 0 })
  scoreP1: number;

  @IsNotEmpty({ groups: [CREATE, UPDATE] })
  @IsNumber({}, { always: true })
  @Column({ default: 0 })
  scoreP2: number;

  @IsNotEmpty({ groups: [UPDATE] })
  @Column()
  winnerId: number;

  /* Relations */

  // TODO verify this logic
  @ManyToOne(() => User, (user: User) => user.games)
  player1: User;

  @ManyToOne(() => User, (user: User) => user.games)
  player2: User;

  @ManyToOne(() => User, (user: User) => user.id)
  winner: User;
}
