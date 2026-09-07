import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@SkipThrottle()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async checkDb(): Promise<string> {
    return this.appService.checkDatabaseConnection();
  }
}
