import { BaseEntity } from 'src/shared/entity-base';
import {
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

@Entity()
export class ActiveChat extends BaseEntity {
  @Column({ nullable: true })
  socketId: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  chatId: number;
}
