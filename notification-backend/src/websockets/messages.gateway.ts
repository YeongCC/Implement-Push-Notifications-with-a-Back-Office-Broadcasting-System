import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:3001', 
    },
  })
  export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private connectedUsers = new Map<string, string>(); 
    private static messagesService: MessagesService;

    static setMessagesService(service: MessagesService) {
      MessagesGateway.messagesService = service;
    }


    async handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.connectedUsers.set(userId, client.id);
        const unreadCounts = await MessagesGateway.messagesService.getUnreadCounts(userId);
        const recipientSocketId = this.connectedUsers.get(userId);
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('unreadCountsUpdated', unreadCounts);
        }
      }
    }
  
    handleDisconnect(client: Socket) {
      const userId = Array.from(this.connectedUsers.entries()).find(([_, socketId]) => socketId === client.id)?.[0];
      if (userId) {
        this.connectedUsers.delete(userId);
      }
    }

    @SubscribeMessage('markAsRead')
    handleMarkAsRead(client: Socket, payload: any) {
      const { messageIds, recipientId, senderId } = payload;
  
      const recipientSocketId = this.connectedUsers.get(recipientId);
      const senderSocketId = this.getClientId(senderId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('messageRead', { messageIds });
      }
    }

    getClientId(userId: string): string | undefined {
      return this.connectedUsers.get(userId);
    }

    broadcastUnreadCounts(userId: string, unreadCounts: any) {
      const recipientSocketId = this.getClientId(userId);
      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('unreadCountsUpdated', unreadCounts);
      }
    }

    
  }
  