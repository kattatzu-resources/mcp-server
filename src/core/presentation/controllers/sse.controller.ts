// src/core/presentation/controllers/sse.controller.ts
import { Request, Response } from 'express';
import { TransportService } from '../../application/services/transport.service.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { HttpError } from '../api/middleware/error.middleware.js';

export class SseController {
  private readonly transportService: TransportService;
  private readonly logger: ILogger;

  constructor(transportService: TransportService, logger: ILogger) {
    this.transportService = transportService;
    this.logger = logger;
  }

  public async establishStream(req: Request, res: Response): Promise<void> {
    this.logger.info('Received GET request to establish SSE stream');

    try {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Create a new transport
      const transport = await this.transportService.createSseTransport(res);
      this.logger.info(
        `Established SSE stream with session ID: ${transport.sessionId}`,
      );
    } catch (error) {
      this.logger.error('Error establishing SSE stream:', error);
      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE stream');
      }
    }
  }

  public async handleMessage(req: Request, res: Response): Promise<void> {
    this.logger.info('Received POST request to handle message');

    // Handle ping message directly
    if (req.body && req.body.method === 'ping') {
      this.logger.info('Received ping message, responding with pong');
      const timestamp = new Date().toISOString();
      res.json({
        jsonrpc: '2.0',
        result: {
          status: 'success',
          message: `Pong! Server is alive at ${timestamp}`,
        },
        id: req.body.id || null,
      });
      return;
    }

    // Extract session ID from URL query parameter
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      this.logger.error('No session ID provided in request URL');
      throw new HttpError('Missing sessionId parameter', 400);
    }

    const transport = this.transportService.getTransport(sessionId);
    if (!transport) {
      this.logger.error(
        `No active transport found for session ID: ${sessionId}`,
      );
      throw new HttpError('Session not found', 404);
    }

    try {
      // Handle the POST message with the transport
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      this.logger.error('Error handling request:', error);
      if (!res.headersSent) {
        throw new HttpError('Error handling request', 500);
      }
    }
  }
}
