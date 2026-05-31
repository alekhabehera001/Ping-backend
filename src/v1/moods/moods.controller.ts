import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { MoodsService } from './moods.service';
import { createMoodSchema, moodHistorySchema } from './validation/moods.validation';

@ApiTags('Moods')
@Controller('v1/moods')
@UseGuards(JwtAuthGuard)
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send mood ping to partner' })
  async createMood(@Request() req: any, @Body(new JoiValidationPipe(createMoodSchema)) body: any) {
    const data = await this.moodsService.createMood(req.user._id.toString(), body.mood, body.note);
    return { message: 'Mood sent', data };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest mood for self and partner' })
  async getLatest(@Request() req: any) {
    const data = await this.moodsService.getLatestMoods(req.user._id.toString());
    return { message: 'Latest moods', data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get mood history for the couple' })
  async getHistory(@Request() req: any, @Query(new JoiValidationPipe(moodHistorySchema)) query: any) {
    const { items, total } = await this.moodsService.getMoodHistory(req.user._id.toString(), query.page, query.limit);
    return { message: 'Mood history', data: { items, total, page: query.page, limit: query.limit } };
  }
}
