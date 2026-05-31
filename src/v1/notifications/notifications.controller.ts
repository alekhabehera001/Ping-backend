import { Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { NotificationsService } from './notifications.service';
import Joi from 'joi';

const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

@ApiTags('Notifications')
@Controller('v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  async list(@Request() req: any, @Query(new JoiValidationPipe(listSchema)) query: any) {
    const { items, total } = await this.notificationsService.getNotifications(req.user._id.toString(), query.page, query.limit);
    const unread = await this.notificationsService.getUnreadCount(req.user._id.toString());
    return { message: 'Notifications fetched', data: { items, total, unread, page: query.page, limit: query.limit } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Request() req: any, @Param('id') id: string) {
    await this.notificationsService.markRead(req.user._id.toString(), id);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Request() req: any) {
    await this.notificationsService.markAllRead(req.user._id.toString());
    return { message: 'All notifications marked as read' };
  }
}
