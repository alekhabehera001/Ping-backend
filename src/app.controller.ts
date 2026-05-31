import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt.guard';

@ApiTags('Health')
@UseGuards(JwtAuthGuard)
@Controller()
export class AppController {
  @Public()
  @ApiOkResponse({ description: 'Welcome message' })
  @Get('/')
  getWelcome() {
    return { message: 'Welcome to klara!' };
  }
}
