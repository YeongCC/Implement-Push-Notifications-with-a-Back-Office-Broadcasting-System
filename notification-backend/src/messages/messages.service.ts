import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from 'src/schemas/subscription.schema'; 
import { Message } from 'src/schemas/message.schema';
import { MessagesGateway } from 'src/websockets/messages.gateway';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
    private readonly configService: ConfigService,
    private readonly messagesGateway: MessagesGateway,
  ) {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const mail = this.configService.get<string>('MAIL');
 
    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys are not set in the environment variables');
    }

    webpush.setVapidDetails(
      mail, 
      vapidPublicKey,
      vapidPrivateKey,
    );
  }

  async saveSubscription(userId: string, subscription: any) {
    await this.subscriptionModel.updateOne(
      { userId },
      { $set: { subscription } },
      { upsert: true },
    );
  }

  private async sendPushNotification(userId: string, payload: any) {
    const subscription = await this.subscriptionModel.findOne({ userId });
    if (subscription) {
      const pushPayload = JSON.stringify(payload);
      webpush.sendNotification(subscription.subscription, pushPayload)
        .catch((error) => console.error('Push notification error:', error));
    }
  }

  async getChatHistory(userId: string, contactId: string) {
    return this.messageModel
      .find({
        $or: [
          { sender: userId, recipient: contactId },
          { sender: contactId, recipient: userId },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(senderId: string, recipientId: string, content: string) {
    const message = new this.messageModel({
      sender: senderId,
      recipient: recipientId,
      content,
      isRead: false,
      createdAt: new Date(),
    });
    const savedMessage = await message.save();
    const unreadCounts = await this.getUnreadCounts(recipientId);
    this.messagesGateway.server.emit('messageReceived', savedMessage);
    await this.messagesGateway.broadcastUnreadCounts(recipientId, unreadCounts);

    const sender = await this.userModel.findById(senderId).exec();
    const senderEmail = sender ? sender.email : 'Unknown Sender';
    await this.sendPushNotification(recipientId, {
      title: 'New Message',
      body: `You have a new message from ${senderEmail}`,
    });

    return savedMessage;
  }

  async markMessagesAsRead(
    messageIds: string[],
    recipientId: string,
    senderId: string,
  ) {
    const result = await this.messageModel.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } },
    );
    this.messagesGateway.server.emit('messageRead', { messageIds });
    const unreadCounts = await this.getUnreadCounts(recipientId);
    await this.messagesGateway.broadcastUnreadCounts(recipientId, unreadCounts);
    return result;
  }

  private async broadcastUnreadCounts(userId: string) {
    const unreadCounts = await this.getUnreadCounts(userId);
    this.messagesGateway.broadcastUnreadCounts(userId, unreadCounts);
  }

  async getUnreadCounts(userId: string) {
    return this.messageModel.aggregate([
      { $match: { recipient: userId, isRead: false } },
      { $group: { _id: '$sender', unreadCount: { $sum: 1 } } },
      { $project: { senderId: '$_id', unreadCount: 1 } },
    ]);
  }

  async sendAdminNotification(recipientId: string, content: string) {
    const recipient = await this.userModel.findById(recipientId).exec();
    const recipientEmail = recipient ? recipient.email : 'Unknown recipient';
    await this.sendPushNotification(recipientId, {
      title: 'Admin Notification',
      body: content,
    });
  
    return { message: 'Notification sent successfully' };
  }
}
