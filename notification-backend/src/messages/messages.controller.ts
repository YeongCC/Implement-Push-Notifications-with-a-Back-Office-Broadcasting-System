import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}


  @Post('subscriptions')
  async addSubscription(@Request() req, @Body() subscription: any) {
    const userId = req.user?.userId;
    return this.messagesService.saveSubscription(userId, subscription);
  }

  @Post('send-notification')
  async sendAdminNotification(
    @Request() req,
    @Body() body: { recipientId: string; content: string }
  ) {
    const isAdmin = req.user?.role === 'admin'; 
    if (!isAdmin) {
      throw new Error('Not authorized');
    }

    const { recipientId, content } = body;
    return this.messagesService.sendAdminNotification(recipientId, content);
  }

  @Post()
  async sendMessage(
    @Request() req,
    @Body() body: { recipientId: string; content: string },
  ) {
    const senderId = req.user?.userId;
    if (!senderId) {
      throw new Error('Sender ID not found in request');
    }
    return this.messagesService.sendMessage(
      senderId,
      body.recipientId,
      body.content,
    );
  }

  @Get(':contactId')
  async getChatHistory(@Request() req, @Param('contactId') contactId: string) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.getChatHistory(userId, contactId);
  }

  @Post('mark-as-read')
  async markMessagesAsRead(
    @Body()
    body: {
      messageIds: string[];
      recipientId: string;
      senderId: string;
    },
  ) {
    return this.messagesService.markMessagesAsRead(
      body.messageIds,
      body.recipientId,
      body.senderId,
    );
  }


}
