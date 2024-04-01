import { BaseEntity } from 'src/shared/entity-base';
import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ChatType } from './enums/chat-type.enum';
import { User } from 'src/user/user.entity';
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
import { Message } from 'src/message/message.entity';

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Chat extends BaseEntity {
  @IsNotEmpty({ groups: [CREATE] })
  @Column()
  type: ChatType;

  @IsNotEmpty({ groups: [CREATE] })
  @Column()
  ownerId: number;

  @IsNotEmpty({ groups: [CREATE] })
  @IsOptional({ groups: [UPDATE] })
  @Column('int', { array: true, default: [] })
  memberList: number[];

  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column({ nullable: true })
  password?: string;

  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column('int', { array: true, default: [] })
  adminList: number[];

  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column('int', { array: true, default: [] })
  banList: number[];

  @IsOptional({ groups: [CREATE, UPDATE] })
  @Column('int', { array: true, default: [] })
  mutedList: number[];

  /* Relations */

  @ManyToOne(() => User, (user: User) => user.chats, { onDelete: 'CASCADE' })
  owner: User;

  // TODO verify ManyToMany

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User)
  @JoinTable()
  bans: User[];

  @ManyToMany(() => User)
  @JoinTable()
  muted: User[];

  @OneToMany((type) => Message, (message: Message) => message.chat, {
    onDelete: 'CASCADE',
  })
  messages: Message[];

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];
}
