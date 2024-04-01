import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { io } from 'socket.io-client';

import { SpriteService } from 'src/app/services/sprite.service';
import { DropDownComponent, Theme } from '../drop-down/drop-down.component';
import { UserService } from 'src/app/services/user.service';

export enum State {
  init,
  queueing,
  awaiting,
  ready,
  active,
  disconnected,
  end,
}

// TODO: put all setup with server in one method
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  constructor(private user: UserService, private route: ActivatedRoute) {
    this.currentTheme = {
      ball: 'assets/ball.png',
      paddle: 'assets/paddle_green.png',
      background: '#0000ff',
      accent: '#ffffff',
      viewValue: '',
    };
  }

  // html related stuff
  @ViewChild('canvas') gameCanvas!: ElementRef;
  private gameContext: CanvasRenderingContext2D;
  @ViewChild('score') scoreCanvas!: ElementRef;
  private scoreContext: CanvasRenderingContext2D;
  @ViewChild('menu') themeMenu: DropDownComponent;
  private currentTheme: Theme;
  private width: number;
  private height: number;
  private lastScore: string = '0 - 0';

  // sprites
  private thisPlayer: SpriteService = new SpriteService();
  private otherPlayer: SpriteService = new SpriteService();
  private ball: SpriteService = new SpriteService();
  private readonly numberOfSprites = 3;
  private numberOfSpritesLoaded = 0;

  // management stuff
  private ioClient: any;
  private sessionID: string;
  private clientID: string;
  public stateEnum = State; // this is necessary to know the different states in the html doc
  public state = this.stateEnum.init;

  menuCallBack(value: any) {
    console.log(value);
    this.currentTheme = value;
    this.loadSprites();
    if (this.state === State.active) this.drawScore(this.lastScore);
  }

  ngOnInit() {
    console.log('enters');
    this.clientID = this.user.getId().toString();
    this.loadSprites();
    this.joinQueue();
    console.log(`my unique id: ${this.clientID}`);
  }

  ngOnDestroy() {
    this.ioClient?.disconnect();
  }

  // _ is the default public queue
  // some special string can be used to play private matches
  joinQueue() {
    let id = this.route.snapshot.paramMap.get('queueID');
    if (id === undefined || id === null) id = '_';
    // TODO: make sure this also disconnects if necessary
    this.state = State.queueing;
    this.ioClient = io(document.location.hostname + ':8080/game', {
      autoConnect: true,
      transports: ['websocket'],
      query: {
        queueID: id,
        clientID: this.clientID,
      },
    });
    this.setListeners();
  }

  // set all of the listeners needed
  setListeners(): void {
    // when receiving gameid and clientid we know the backend is ready to receive info about the sprites we loaded
    this.ioClient.on('id', (sharedID: string) => {
      console.log(`shared ID: ${sharedID}`);
      this.state = State.ready;
      this.sessionID = sharedID;
      this.initBackend();
    });
    // remove canvses and set state accordingly on disconnect
    this.ioClient.on('disconnected', () => {
      this.state = State.disconnected;
      this.scoreContext.clearRect(
        0,
        0,
        this.scoreContext.canvas.width,
        this.scoreContext.canvas.height
      );
      this.gameContext.clearRect(
        0,
        0,
        this.gameContext.canvas.width,
        this.gameContext.canvas.height
      );
    });
    this.ioClient.on('scoreChange', (data: string) => {
      this.lastScore = data;
      this.drawScore(data);
    });
    this.ioClient.on('win', () => {
      this.drawScore('WIN');
      this.state = State.end;
    });
    this.ioClient.on('loss', () => {
      this.drawScore('LOSS');
      this.state = State.end;
    });
  }

  // browser event listeners
  @HostListener('window:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent): void {
    if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
      event.preventDefault();
      this.ioClient.emit(
        'keydown',
        JSON.stringify({
          uniqueID: this.clientID,
          sharedID: this.sessionID,
          key: event.key,
        })
      );
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent): void {
    if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
      event.preventDefault();
      this.ioClient.emit(
        'keyup',
        JSON.stringify({
          uniqueID: this.clientID,
          sharedID: this.sessionID,
          key: event.key,
        })
      );
    }
  }
  // end browser event listeners

  loadSprites(): void {
    this.thisPlayer.setSource(this.currentTheme.paddle);
    this.otherPlayer.setSource(this.currentTheme.paddle);
    this.ball.setSource(this.currentTheme.ball);
  }

  initCanvas(): void {
    this.gameContext = this.gameCanvas.nativeElement.getContext('2d');
    this.gameContext.canvas.width = this.width;
    this.gameContext.canvas.height = this.height;
    this.scoreContext = this.scoreCanvas.nativeElement.getContext('2d');
    this.scoreContext.canvas.width = 300;
    this.scoreContext.canvas.height = 150;
  }

  // positions are sent by backend
  setSpritePositions(data: any): void {
    this.thisPlayer.setPos(data.activePlayer.x, data.activePlayer.y);
    this.otherPlayer.setPos(data.otherPlayer.x, data.otherPlayer.y);
    this.ball.setPos(data.ball.x, data.ball.y);
  }

  // if all sprites are loaded we send their info to the backend
  signalReady(): void {
    this.numberOfSpritesLoaded += 1;
    if (this.numberOfSpritesLoaded == this.numberOfSprites) {
      this.ioClient.on('init', (data: any) => {
        this.width = data.board.width;
        this.height = data.board.height;
        this.setSpritePositions(data);
        this.initCanvas();
      });
      this.ioClient.emit(
        'init',
        JSON.stringify({
          uniqueID: this.clientID,
          sharedID: this.sessionID,
          player: {
            width: this.thisPlayer.getWidth(),
            height: this.thisPlayer.getHeight(),
          },
          ball: { width: this.ball.getWidth(), height: this.ball.getHeight() },
        })
      );
    }
  }

  initSprite(sprite: SpriteService): void {
    if (sprite.complete()) {
      this.signalReady();
    } else {
      sprite.addEventListener('load', () => {
        this.signalReady();
      });
    }
  }

  initBackend(): void {
    this.initSprite(this.thisPlayer);
    this.initSprite(this.otherPlayer);
    this.initSprite(this.ball);
  }

  drawScore(text: string): void {
    this.scoreContext.fillStyle = this.currentTheme.background;
    this.scoreContext.fillRect(
      0,
      0,
      this.scoreContext.canvas.width,
      this.scoreContext.canvas.height
    );
    this.scoreContext.strokeStyle = this.currentTheme.accent;
    this.scoreContext.lineWidth = 8;
    this.scoreContext.strokeRect(
      0,
      0,
      this.scoreContext.canvas.width,
      this.scoreContext.canvas.height
    );
    this.scoreContext.font = '80px Helvetica';
    this.scoreContext.textAlign = 'center';
    this.scoreContext.strokeText(
      text,
      this.scoreContext.canvas.width / 2,
      this.scoreContext.canvas.height / 2 + 20
    );
  }

  drawTable(): void {
    // fill table and draw lines
    this.gameContext.fillStyle = this.currentTheme.background;
    this.gameContext.fillRect(
      0,
      0,
      this.gameContext.canvas.width,
      this.gameContext.canvas.height
    );
    this.gameContext.strokeStyle = this.currentTheme.accent;
    this.gameContext.lineWidth = 12;
    this.gameContext.strokeRect(
      0,
      0,
      this.gameContext.canvas.width,
      this.gameContext.canvas.height
    );
    this.gameContext.moveTo(0, this.gameContext.canvas.height / 2);
    this.gameContext.lineWidth = 3;
    this.gameContext.lineTo(
      this.gameContext.canvas.width,
      this.gameContext.canvas.height / 2
    );
    this.gameContext.stroke();

    // draw sprites
    this.thisPlayer.drawToCanvas(this.gameContext);
    this.otherPlayer.drawToCanvas(this.gameContext);
    this.ball.drawToCanvas(this.gameContext);
  }

  // let backend know gameplay can start and
  // prepare client side for it
  onStart(): void {
    if (this.sessionID != undefined) {
      this.state = State.awaiting;
      this.ioClient.emit('awaiting', this.sessionID);
      this.ioClient.on('update', (data: any) => {
        this.state = State.active;
        this.setSpritePositions(data);
        this.drawTable();
      });
    }
  }

  // basically the same as reconstructing the component
  onReconnect() {
    this.numberOfSpritesLoaded = 0;
    this.loadSprites();
    this.state = State.init;
    this.ioClient.disconnect();
    this.joinQueue();
  }
}
