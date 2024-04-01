import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { FortytwoStrategy } from './strategy/fortytwo.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/refreshjwt.strategy';
import { JwtTwoFactorStrategy } from './strategy/twofactorjwt.strategy';
import { ChatModule } from 'src/chat/chat.module';
import { WsJwtStrategy } from './strategy/wsjwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          signOptions: { expiresIn: '15m' },
          secret: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    FortytwoStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    JwtTwoFactorStrategy,
    WsJwtStrategy,
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
