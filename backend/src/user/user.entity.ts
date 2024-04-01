import { BaseEntity } from 'src/shared/entity-base';
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { UserStatus } from './enums/user-status.enum';
import { Statistic } from 'src/statistic/statistic.entity';
import { Message } from 'src/message/message.entity';
import { Exclude } from 'class-transformer';
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
import { Chat } from 'src/chat/chat.entity';
import { GameRecord } from 'src/game/game-record/game-record.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class User extends BaseEntity {
  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ unique: true })
  intraName: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ default: '' })
  userName: string;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ default: '' })
  avatar: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Column('int', { array: true, default: [] })
  friendList: number[];

  @Column('int', { array: true, default: [] })
  blockList: number[];

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsString({ always: true })
  @Column({ nullable: true, type: 'text' })
  @Exclude()
  refreshToken?: string;

  @Column({ nullable: true })
  twoFactorAuthSecret?: string;

  @Column({ default: false })
  isTwoFactorAuthEnabled: boolean;

  @IsOptional({ groups: [UPDATE] })
  @IsNotEmpty({ groups: [CREATE] })
  @IsNumber({}, { always: true })
  @Column()
  statId: number;

  /* Relations */

  @OneToOne(() => Statistic)
  @JoinColumn()
  statistics: Statistic;

  @OneToMany((type) => Chat, (chat: Chat) => chat.owner)
  chats?: Chat[];

  @OneToMany((type) => Message, (message: Message) => message.sender)
  messages?: Message[];

  @OneToMany(
    (type) => GameRecord,
    (game: GameRecord) => game.player1 || game.player2,
  )
  games?: GameRecord[];

  /* Misc */
  activeChatId: number;
}
