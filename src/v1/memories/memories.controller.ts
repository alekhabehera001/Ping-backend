import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { MemoriesService } from './memories.service';
import { createMemorySchema, memoriesListSchema, presignedUrlSchema } from './validation/memories.validation';

@ApiTags('Memories')
@Controller('v1/memories')
@UseGuards(JwtAuthGuard)
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post('presigned')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get S3 presigned upload URL' })
  async getPresigned(@Request() req: any, @Body(new JoiValidationPipe(presignedUrlSchema)) body: any) {
    const data = await this.memoriesService.getPresignedUrl(req.user._id.toString(), body.contentType, body.fileName);
    return { message: 'Presigned URL generated', data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save memory after upload' })
  async create(@Request() req: any, @Body(new JoiValidationPipe(createMemorySchema)) body: any) {
    const data = await this.memoriesService.createMemory(req.user._id.toString(), body);
    return { message: 'Memory saved', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get memory timeline (cursor-based)' })
  async getTimeline(@Request() req: any, @Query(new JoiValidationPipe(memoriesListSchema)) query: any) {
    const data = await this.memoriesService.getTimeline(req.user._id.toString(), query.cursor, query.limit);
    return { message: 'Timeline fetched', data };
  }

  @Get('monthly-recap')
  @ApiOperation({ summary: 'Get memories grouped by month' })
  async getMonthlyRecap(@Request() req: any) {
    const data = await this.memoriesService.getMonthlyRecap(req.user._id.toString());
    return { message: 'Monthly recap', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete memory' })
  async deleteMemory(@Request() req: any, @Param('id') id: string) {
    await this.memoriesService.deleteMemory(req.user._id.toString(), id);
    return { message: 'Memory deleted' };
  }
}
