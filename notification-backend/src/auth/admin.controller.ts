import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { AdminGuard } from './admin.guard';
  import { MessagesService } from '../messages/messages.service';
import { JwtAuthGuard } from './jwt-auth.guard';
  
  @Controller('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  export class AdminController {
    constructor(private messagesService: MessagesService) {}
  
    @Post('send-notification')
    async sendAdminNotification(
      @Request() req,
      @Body() body: { recipientId: string; content: string }
    ) {
      const { recipientId, content } = body;
      return this.messagesService.sendAdminNotification(recipientId, content);
    }
  }
  