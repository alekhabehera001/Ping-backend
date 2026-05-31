import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { AnswersService } from './answers.service';
import { historySchema, submitAnswerSchema } from './validation/answers.validation';

@ApiTags('Answers')
@Controller('v1/answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit answer to daily question' })
  async submit(@Request() req: any, @Body(new JoiValidationPipe(submitAnswerSchema)) body: any) {
    const data = await this.answersService.submitAnswer(req.user._id.toString(), body.questionId, body.text);
    return { message: 'Answer submitted', data };
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today answers (reveals after both answered)' })
  async getToday(@Request() req: any, @Query('questionId') questionId: string) {
    if (!questionId) throw new Error('questionId is required');
    const data = await this.answersService.getTodayAnswers(req.user._id.toString(), questionId);
    return { message: 'Answers fetched', data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get answer history' })
  async getHistory(@Request() req: any, @Query(new JoiValidationPipe(historySchema)) query: any) {
    const { items, total } = await this.answersService.getHistory(req.user._id.toString(), query.page, query.limit);
    return { message: 'History fetched', data: { items, total, page: query.page, limit: query.limit } };
  }
}
