import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { SpriteService } from './sprite/sprite.service';
import { MatchMakerService } from './match-maker/match-maker.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UserSeeder } from './utilities/user.seeder';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { TwoFactorAuthService } from './2fa/two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './2fa/two-factor-authentication.controller';
import { AuthService } from './auth/auth.service';
import { TwoFactorAuthModule } from './2fa/two-factor-auth.module';
import { GameRecordModule } from './game/game-record/game-record.module';
import { StatisticModule } from './statistic/statistic.module';
import { StatisticService } from './statistic/statistic.service';
import { GameRecordService } from './game/game-record/game-record.service';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadController } from './upload/upload.controller';
import { ChatGateway } from './chat/gateways/chat.gateway';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UserModule,
    AuthModule,
    TwoFactorAuthModule,
    ChatModule,
    MessageModule,
    StatisticModule,
    GameModule,
    GameRecordModule,
    MulterModule.register({
      dest: './src/public/uploads',
    }),
    ServeStaticModule.forRoot({
      serveRoot: '/uploads',
      rootPath: './src/public/uploads',
    }),
  ],
  controllers: [AppController, UploadController],
  providers: [
    AppService,
    SpriteService,
    MatchMakerService,
    UserSeeder,
    TwoFactorAuthService,
    StatisticService,
    GameRecordService,
  ],
})
export class AppModule {}
