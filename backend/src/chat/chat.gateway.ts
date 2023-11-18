import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('newMessage')
  chatMessageToRoom(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log('message recieved');
    this.logger.log(data);
    const rooms = [...client.rooms];
    this.logger.log('rooms', rooms);
    this.server.to(rooms[1]).emit('sendToClient', data, client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoin(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    this.logger.log(`join room: ${client.id} joined room ${roomId}`);
    client.join(roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeave(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`leave room: ${client.id} leaved room ${roomId}`);
    client.leave(roomId);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}