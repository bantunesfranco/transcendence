import {
	Column,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

export abstract class BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	@CreateDateColumn()
	public createdAt: Date;

	@Column()
	@UpdateDateColumn()
	public updatedAt: Date;
}
