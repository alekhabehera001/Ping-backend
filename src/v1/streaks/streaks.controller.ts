import { Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { StreaksService } from './streaks.service';

@ApiTags('Streaks')
@Controller('v1/streaks')
@UseGuards(JwtAuthGuard)
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get()
  @ApiOperation({ summary: 'Get streak info and badges' })
  async getStreak(@Request() req: any) {
    const data = await this.streaksService.getStreak(req.user._id.toString());
    return { message: 'Streak fetched', data };
  }

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use streak recovery token' })
  async recoverStreak(@Request() req: any) {
    await this.streaksService.recoverStreak(req.user._id.toString());
    return { message: 'Streak recovered' };
  }
}
