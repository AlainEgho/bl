import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Hello (requires JWT)' })
  getHello(): string {
    return this.appService.getHello();
  }
}
