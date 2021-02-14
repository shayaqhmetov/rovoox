import { Moment } from "moment";
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Using this method user is able to get current server time
   * @param res Response
   */
  @Get('/now')
  today() {
    return {
      timestamp: this.appService.today()
    }
  }
}
