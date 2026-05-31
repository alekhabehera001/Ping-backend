import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { createQuestionSchema, listQuestionsSchema } from './validation/questions.validation';
import { QuestionsService } from './questions.service';

@ApiTags('Questions')
@Controller('v1/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's question" })
  async getToday(@Request() req: any) {
    const data = await this.questionsService.getOrCreateTodayQuestion();
    return { message: "Today's question", data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create question (admin)' })
  async create(@Body(new JoiValidationPipe(createQuestionSchema)) body: any) {
    const data = await this.questionsService.create(body);
    return { message: 'Question created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all questions (paginated)' })
  async list(@Query(new JoiValidationPipe(listQuestionsSchema)) query: any) {
    const { items, total } = await this.questionsService.list(query.page, query.limit, query.category);
    return {
      message: 'Questions fetched',
      data: { items, total, page: query.page, limit: query.limit },
    };
  }
}
