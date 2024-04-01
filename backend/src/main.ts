import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { join } from 'node:path';
import { default as cookieParser } from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { UserSeeder } from './utilities/user.seeder';

// This is needed because the 42API requires a secure connection in order to talk to our server
// The ssl certs are generate by mkcert!
const httpsOptions = {
  key: readFileSync(join(__dirname, '..', 'ssl', 'cert.key')),
  cert: readFileSync(join(__dirname, '..', 'ssl', 'cert.crt')),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.use(cookieParser());

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: `http://${configService.getOrThrow('HOST')}:4200`,
    credentials: true,
  });

  const seeder = app.get(UserSeeder);
  if (configService.getOrThrow('SEED') == true) seeder.seedUsers();

  await app.listen(3000);
}
bootstrap();
