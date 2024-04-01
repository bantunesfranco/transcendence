/*
 *  This class is responsible for handling all websocket connections and emits for the game.
 *  It also manages the game and matchmaker services.
 */

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { createHash, randomBytes } from 'crypto';
import { GameService } from 'src/game/game.service';
import { MatchMakerService } from 'src/match-maker/match-maker.service';

// gateway that handles all messages and connections for the game
@WebSocketGateway(8080, { // TODO: set max disconnect duration
  cors: true,
  namespace: 'game'
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private gameManager: GameService, private matchMaker: MatchMakerService) { }

  afterInit() {
    console.log('Initialized');
  }

  // upon connection clients get added to a queue
  // every time we add to queue we check if a new match can be started
  handleConnection(client: any, ...args: any[]) {
    console.log(`Client id: ${client.id} connected`);
    console.log(`Requested queue id: ${client.handshake.query.queueID}`);

    let ready = this.matchMaker.updateQueue(client.handshake.query.queueID, client);
    if (ready != null) {
      let hash = createHash('md5');
      hash.update(randomBytes(16));
      let shared_id = hash.digest('base64');
      let unique_id = [ready.clients[0].handshake.query.clientID, ready.clients[1].handshake.query.clientID];
      console.log(`unique id's: ${unique_id}`);
      this.gameManager.addGame(shared_id, unique_id, ready.clients);
      ready.clients.forEach(element => { element.emit('id', shared_id); });
    }
  }

  // remove client from the queue or game they were in
  handleDisconnect(client: any) {
    console.log(`Client id:${client.id} disconnected`);

    this.matchMaker.removeClientFromQueue(client);
    this.gameManager.resetGameByClient(client);
  }

  // two-way initialization of the game
  @SubscribeMessage('init')
  handleInit(client: any, args: string) {
    console.log(`Init received from client id: ${client.id}`);

    let data = JSON.parse(args);
    this.gameManager.games.get(data.sharedID).init(data);
    client.emit('init', this.gameManager.games.get(data.sharedID).serialize(data.uniqueID));
  }

  // signal that gameplay can start
  @SubscribeMessage('awaiting')
  handeAwaiting(client: any, sharedID: string) {
    console.log(`Awaiting received from client id: ${client.id}`);

    this.gameManager.launch(sharedID);
  }

  // handle key down events
  @SubscribeMessage('keydown')
  handleKeyDown(client: any, args: string) {
    let data = JSON.parse(args);
    this.gameManager.games.get(data.sharedID).keyDown(data.uniqueID, data.key);
  }

  // handle key up events
  @SubscribeMessage('keyup')
  handleKeyUp(client: any, args: string) {
    let data = JSON.parse(args);
    this.gameManager.games.get(data.sharedID).keyUp(data.uniqueID, data.key);
  }
}
