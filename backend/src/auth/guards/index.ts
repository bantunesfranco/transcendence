import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') { }

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }

@Injectable()
export class JwtTwoFactorGuard extends AuthGuard('twofactorjwt') { }

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwtrefresh') { }

@Injectable()
export class WsJwtGuard extends AuthGuard('wsjwt') {
    constructor () {
        super();
    }
    
    getRequest(context: ExecutionContext) {
        const data = context.switchToWs().getClient();
        // console.log(`This is my data.header.cookie inside the guard`, data.handshake.headers);
        return data.handshake.headers;
    }

    handleRequest(err, user, info, context) {
        if (err || !user) {
            throw err || new WsException('Unauthorized Jwt WS connection!');
        }
        const client = context.switchToWs().getClient();
        client.user = user;
        return user;
    }
}