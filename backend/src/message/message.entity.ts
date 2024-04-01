import { Chat } from 'src/chat/chat.entity';
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
export class Message extends BaseEntity {
  // @IsOptional({ groups: [CREATE] })
  // @IsNotEmpty({ groups: [UPDATE] })
  @Column({ nullable: true }) // in case of a DM => no chat (i.e. channel)
  chatId: number;

  @Column({ nullable: false })
  senderId: number;

  @IsNotEmpty({ always: true })
  @Column({ type: 'text', nullable: false })
  content: string;

  /* Relations */

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages, { onDelete: 'CASCADE' })
  chat?: Chat;

  @ManyToOne(() => User, (user: User) => user.messages, { onDelete: 'CASCADE' })
  sender: User;

  isLink: boolean = false;
}
