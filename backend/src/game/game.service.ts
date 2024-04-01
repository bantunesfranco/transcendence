/*
 *  this file contains two classes:
 *  - a Game class to represent a single game
 *  - a GameService class to manage all Game instances
 */

import { Injectable } from '@nestjs/common';
import { interval, take } from 'rxjs';
import { SpriteService } from 'src/sprite/sprite.service';
import { GameRecord } from './game-record/game-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameRecordDto } from './game-record/dto/create-game-record.dto';
import { validate } from 'class-validator';
import { GameRecordService } from './game-record/game-record.service';

class Player {
  public sprite = new SpriteService();
  public socket: any;
  public score = 0;
  public left: boolean; // indicates whether the player is 'truly' the left player
}

class Game {
  constructor(
    private readonly gameRecordService: GameRecordService,
    ids: any[],
    sockets: any[],
  ) {
    for (let i = 0; i < 2; i++) {
      let player = new Player();
      player.sprite = new SpriteService();
      player.socket = sockets[i];
      player.score = 0;
      this.players.set(ids[i], player);
    }
  }

  public ball: SpriteService = new SpriteService();
  public gameID: number;
  public players = new Map<string, Player>();
  public numberClientsReady = 0;
  public lastCollision: number = 0;
  public active: boolean = false;
  private firstInit = true;

  // game settings
  public static readonly width = 1200;
  public static readonly height = 700;
  public static readonly frameRate = 35;
  public static readonly playerSpeed = 25 * (30 / Game.frameRate);
  public static readonly ballSpeed = 20 * (30 / Game.frameRate);
  public static readonly collisionTimeThresh: number =
    (1000 / Game.frameRate) * 5;

  // set dimensions and positions of the sprites
  init(data: any): void {
    let uniqueID = data.uniqueID;
    if (this.firstInit) {
      // init first player
      this.players.get(uniqueID).sprite.setPos(10, 200);
      this.players
        .get(uniqueID)
        .sprite.setDim(data.player.width, data.player.height);
      this.players.get(uniqueID).left = true;
    } else {
      // init second player;
      this.players
        .get(uniqueID)
        .sprite.setPos(Game.width - data.player.width - 10, 200);
      this.players
        .get(uniqueID)
        .sprite.setDim(data.player.width, data.player.height); // TODO: check that dimensions are the same
      this.players.get(uniqueID).left = false;
      return;
    }
    // init ball
    this.ball.setPos(Game.width / 2, Game.height / 2);
    this.ball.setDim(data.ball.width, data.ball.height);
    let lut = [1, 5, 7, 11];
    let angle = lut[Math.floor(Math.random() * lut.length)] * Math.PI / 6;
    this.ball.setDir(Math.cos(angle), Math.sin(angle));
    this.firstInit = !this.firstInit;
  }

  // serialize all positions with the correct pov per player
  serialize(id: string): object {
    let activeSprite: SpriteService, otherSprite: SpriteService;
    this.players.forEach((value, key) => {
      if (key === id) activeSprite = value.sprite;
      else otherSprite = value.sprite;
    });
    let activeX = activeSprite.getX(),
      otherX = otherSprite.getX(),
      ballX = this.ball.getX();
    if (activeX > otherX) {
      // make sure active player is always on the left
      otherX = [activeX, (activeX = otherX)][0];
      ballX = Game.width - ballX - this.ball.getWidth();
    }
    return {
      board: { width: Game.width, height: Game.height },
      activePlayer: { x: activeX, y: activeSprite.getY() },
      otherPlayer: { x: otherX, y: otherSprite.getY() },
      ball: { x: ballX, y: this.ball.getY() },
    };
  }

  // check for points scored, collisions, gameover, etc.
  update(): void {
    if (this.pointScored()) {
      let players = Array.from(this.players.values());
      if (players[0].score === 3 || players[1].score === 3) {
        this.gameFinished();
        return;
      }
      players[0].socket.emit(
        'scoreChange',
        `${players[0].score} - ${players[1].score}`,
      );
      players[1].socket.emit(
        'scoreChange',
        `${players[1].score} - ${players[0].score}`,
      );
      this.ball.setPos(Game.width / 2, Game.height / 2);
      let lut = [1, 5, 7, 11];
      let angle = lut[Math.floor(Math.random() * lut.length)] * Math.PI / 6;
      this.ball.setDir(Math.cos(angle), Math.sin(angle));
    } else {
      this.ball.moveBall(Game.ballSpeed, 1, 3);
      this.players.forEach((player) => {
        player.sprite.movePlayer(Game.playerSpeed, 1, 1, Game.height);
      });
      this.checkCollisions();
      this.players.forEach((player, id) => {
        player.socket.emit('update', this.serialize(id));
      });
    }
  }

  // input handling
  keyDown(id: string, data: string): void {
    switch (data) {
      case 'ArrowUp':
        this.players.get(id).sprite.setDir(0, -1);
        break;
      case 'ArrowDown':
        this.players.get(id).sprite.setDir(0, 1);
        break;
    }
  }

  keyUp(id: string, data: string): void {
    switch (data) {
      case 'ArrowUp':
      case 'ArrowDown':
        this.players.get(id).sprite.setDir(0, 0);
        break;
    }
  }
  // end input handling

  // figure out if and who actually scored the point and update score
  pointScored(): boolean {
    let players = Array.from(this.players.values());
    if (this.ball.getX() + this.ball.getWidth() < 0) {
      if (players[0].left) players[1].score++;
      else players[0].score++;
      return true;
    }
    if (this.ball.getX() > Game.width) {
      if (players[0].left) players[0].score++;
      else players[1].score++;
      return true;
    }
    return false;
  }

  // check if score limit reached
  gameFinished(): void {
    this.active = false;
    this.players.forEach((player) => {
      player.score === 3
        ? player.socket.emit('win')
        : player.socket.emit('loss');
    });
    let players = Array.from(this.players.values());
    let player_1_id = players[0].socket.handshake.query.clientID;
    let player_2_id = players[1].socket.handshake.query.clientID;
    let winner_id =
      players[0].score > players[1].score ? player_1_id : player_2_id;

    const newGameRecordDto: CreateGameRecordDto = {
      player1Id: player_1_id,
      player2Id: player_2_id,
      scoreP1: players[0].score,
      scoreP2: players[1].score,
      winnerId: winner_id,
    };

    this.gameRecordService
      .create(newGameRecordDto)
      .then((newGameRecord) => {
        console.log('Game info saved:', newGameRecord);
      })
      .catch((error) => {
        console.error('Error saving game info:', error);
      });
  }

  // check wall and paddle collisions
  checkCollisions(): void {
    if (
      this.ball.getY() < 0 ||
      this.ball.getY() + this.ball.getHeight() > Game.height
    ) {
      this.ball.setDir(this.ball.getDirX(), -this.ball.getDirY());
      // return ?
    }
    if (Date.now() - this.lastCollision < Game.collisionTimeThresh) {
      return;
    }
    this.players.forEach((player) => {
      if (this.collides(player.sprite, this.ball)) {
        let dir = this.postCollisionDir(player.sprite, this.ball);
        this.ball.setDir(dir[0], dir[1]);
        this.lastCollision = Date.now();
      }
    });
  }

  pointInRect(rect: SpriteService, x: number, y: number): boolean {
    return (
      rect.getX() <= x &&
      x <= rect.getX() + rect.getWidth() &&
      rect.getY() <= y &&
      y <= rect.getY() + rect.getHeight()
    );
  }

  collides(paddle: SpriteService, ball: SpriteService): boolean {
    let points = this.getContactPoints(ball);
    return (
      this.pointInRect(paddle, points.side[0], points.side[1]) ||
      this.pointInRect(paddle, points.top[0], points.top[1]) ||
      this.pointInRect(paddle, points.bottom[0], points.bottom[1])
    );
  }

  // get points where a round object would touch in stead of sprite coreners (rectangle)
  getContactPoints(ball: SpriteService) {
    let side = [ball.getX(), ball.getY() + ball.getHeight() / 2];
    if (ball.getDirX() > 0) side[0] += ball.getWidth();
    let top = [ball.getX() + ball.getWidth() / 2, ball.getY()];
    let bottom = [
      ball.getX() + ball.getWidth() / 2,
      ball.getY() + ball.getHeight(),
    ];
    return {
      side: side,
      top: top,
      bottom: bottom,
    };
  }

  // get ball direction after collision in a breakout fashion
  postCollisionDir(paddle: SpriteService, ball: SpriteService): Array<number> {
    let sign = ball.getDirX() < 0 ? 1 : -1;
    let theta = Math.max(
      Math.min(
        (ball.getY() +
          ball.getHeight() / 2 -
          (paddle.getY() + paddle.getHeight() / 2)) /
        (paddle.getHeight() / 2),
        1,
      ),
      -1,
    );
    theta *= Math.PI * 0.2;
    return [Math.cos(theta) * sign, Math.sin(theta)];
  }
}

// manager for all game instances
@Injectable()
export class GameService {
  constructor(private readonly gameRecordService: GameRecordService) {
    interval(1000 / Game.frameRate).subscribe(() => this.update());
  }
  games: Map<string, Game> = new Map<string, Game>(); // map shared id between clients to game

  addGame(id: string, ids: any[], sockets: any[]) {
    this.games.set(id, new Game(this.gameRecordService, ids, sockets));
    console.log(`created game with id: ${id}`);
  }

  reset(id: string): void {
    this.games.delete(id);
  }

  // set game state to active if both players are ready
  launch(id: string): void {
    this.games.get(id).numberClientsReady += 1;
    console.log('no ready clients: ', this.games.get(id).numberClientsReady);
    if (this.games.get(id).numberClientsReady == 2) {
      // countdown
      let numbers = interval(1000);
      let first_four = numbers.pipe(take(4));
      first_four.subscribe((n) => {
        if (n < 3) {
          // drawing the countdown in the score box
          this.games.get(id).players.forEach((player) => {
            player.socket.emit('scoreChange', (3 - n).toString());
          });
        } else {
          this.games.get(id).players.forEach((player) => {
            player.socket.emit('scoreChange', '0 - 0');
          });
          this.games.get(id).active = true;
        }
      });
    }
  }

  update(): void {
    this.games.forEach((game) => {
      if (game.active) game.update();
    });
  }

  // surely there is a better way to implement this
  resetGameByClient(client: any) {
    this.games.forEach((game, gameID) => {
      game.players.forEach((player) => {
        if (player.socket === client) {
          console.log('removing game');
          this.games.get(gameID).players.forEach((player) => {
            player.socket.emit('disconnected');
          }); // emitting disconnected means the OTHER client disconnected
          this.games.delete(gameID);
        }
      });
    });
  }
}
