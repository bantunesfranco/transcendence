import { BaseEntity } from "./base-entity.interface";
import { User } from "./user.interface";

export interface GameRecord extends BaseEntity {
	player1Id: number;
	player2Id: number;
	scoreP1: number;
	scoreP2: number;
	winnerId: number;

	player1: User;
	player2: User;
	winner: User;
}