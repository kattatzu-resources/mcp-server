// src/core/presentation/api/routes/sse.routes.ts
import { Router } from 'express';
import { SseController } from '../../controllers/sse.controller.js';
import { ILogger } from '../../../domain/interfaces/logger.interface.js';
import { TransportService } from '../../../application/services/transport.service.js';

export const createSseRoutes = (
  transportService: TransportService,
  logger: ILogger,
): Router => {
  const router = Router();
  const sseController = new SseController(transportService, logger);

  // SSE endpoint for establishing the stream
  router.get('/', sseController.establishStream.bind(sseController));

  // Messages endpoint for receiving client JSON-RPC requests
  router.post('/', sseController.handleMessage.bind(sseController));

  return router;
};
