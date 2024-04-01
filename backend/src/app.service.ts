import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Object {
    return { access_token: 'Hello from backend!' };
  }
}
