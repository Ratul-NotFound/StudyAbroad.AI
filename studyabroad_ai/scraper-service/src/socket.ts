/**
 * Socket.io Server — Real-time scraping event streaming
 * Broadcasts job progress, results, and errors to connected clients
 */

import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { logger } from './logger';

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Use Redis adapter for multi-instance scaling (optional, add later)
    // adapter: createAdapter(pubClient, subClient),
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.io] Client connected: ${socket.id}`);

    // Client can subscribe to specific job updates
    socket.on('subscribe:job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      logger.info(`[Socket.io] ${socket.id} subscribed to job ${jobId}`);
    });

    // Client can subscribe to all events of a type
    socket.on('subscribe:type', (type: 'university' | 'scholarship' | 'visa') => {
      socket.join(`type:${type}`);
      logger.info(`[Socket.io] ${socket.id} subscribed to ${type} events`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });

    // Ping/pong keep-alive
    socket.on('ping', () => socket.emit('pong'));
  });

  return io;
}
