import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from "../auth/auth.module"
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    AuthModule,
    GameModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule { }
