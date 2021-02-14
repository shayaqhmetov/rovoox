import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import firebase from 'firebase';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Using this method user is able to get current server time
   */
  @Get('/now')
  today() {
    return {
      timestamp: this.appService.today()
    }
  }

  /**
   * Using this method user is able to get current server time
   * @param res Response
   */
  @Get('/leaderboard')
  async leaderboard(@Res() res: Response) {
    const db = firebase.database();
    const ref = db.ref('users').orderByChild('/points');
    let users = await new Promise((resolve, reject) => {
      ref.limitToLast(10).on('value', (snapshot) => {
        const result = []
        let place = 10;
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          const name = childSnapshot.key;
          result.unshift({
            place,
            name,
            points: user['points']
          });
          place -= 1;
        });
        resolve(result);
      }, err => reject(err));
    });
    res.status(HttpStatus.OK).json(users);
  }

}
