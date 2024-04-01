/*
 *  Class to manage queues and waiting clients
 *  On every (dis)connect the gateway will call the appropriate methods
 */

import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class MatchMakerService {
  private queues_: Map<string, Array<object>> = new Map<string, Array<object>>;

  // add client to selected queue and return resulting length of queue
  private pushOrCreate(id: string, client: object): number {
    if (this.queues_.has(id)) {
      let arr = this.queues_.get(id);
      return (arr.push(client));
    }
    this.queues_.set(id, [client]);
    return (1);
  }

  // create 3 random and secure id's
  // 2 unique, 1 shared
  createIDSet(): any {
    let ids: string[] = new Array<string>;
    for (let i: number = 0; i < 3; i++) {
      let hash = createHash('md5');
      hash.update(randomBytes(16));
      ids.push(hash.digest('base64'));
    }
    return ({
      shared: ids[0],
      unique: ids.slice(1)
    });
  }

  // add client to queue
  // if a match can be made, pop top 2 clients
  updateQueue(id: string, client: object): any {
    console.log(`key: ${id}`);
    let len = this.pushOrCreate(id, client);
    if (len % 2 == 0 && len > 0) {
      let readyClients = this.queues_.get(id).slice(0, 2);
      this.queues_.set(id, this.queues_.get(id).slice(2));
      console.log('match made!');
      return ({
        gameID: id,
        clients: readyClients
      })
    }
    return (null);
  }

  // brute-force client lookup
  removeClientFromQueue(client: any) {
    this.queues_.forEach((sockets, id) => {
      sockets.forEach((socket) => {
        if (socket === client) {
          console.log('removing client from queue');
          this.queues_.set(id, sockets.filter((value) => { value != socket; }));
        }
      })
    })
  }
}
