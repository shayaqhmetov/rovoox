import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  today(): string {
    return new Date(Date.now()).toLocaleString();
  }
}
