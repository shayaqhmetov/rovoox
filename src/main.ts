import { NestFactory } from '@nestjs/core';
import { AppModule } from './main/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Import firebase-admin
import firebase from 'firebase';
import * as admin from 'firebase-admin';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  // Set the config options
  const adminConfig = {
    "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
    "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };


  var firebaseConfig = {
    apiKey: configService.get<string>('FIREBASE_API_KEY'),
    authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
    databaseURL: configService.get<string>('FIREBASE_DATABSE_URL'),
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: configService.get<string>('FIREBASE_MEASURMENT_SENDER_ID'),
    appId: configService.get<string>('FIREBASE_APP_ID'),
    measurementId: configService.get<string>('FIREBASE_MEASURMENT_ID')
  };

  // Initialize the firebase admin app
  firebase.initializeApp(firebaseConfig);
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: configService.get<string>('FIREBASE_DATABSE_URL')
  })
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(configService.get<string>('API_PORT') || 3000);
}
bootstrap();
