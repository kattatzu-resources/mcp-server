// src/core/presentation/api/app.ts
import express, { Express } from 'express';
import { ServerConfig } from '../../domain/models/server-config.model.js';
import { TransportService } from '../../application/services/transport.service.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { ErrorMiddleware } from './middleware/error.middleware.js';
import { createSseRoutes } from './routes/sse.routes.js';

export class ExpressApp {
  private readonly app: Express;
  private readonly config: ServerConfig;
  private readonly transportService: TransportService;
  private readonly logger: ILogger;

  constructor(
    config: ServerConfig,
    transportService: TransportService,
    logger: ILogger,
  ) {
    this.config = config;
    this.transportService = transportService;
    this.logger = logger;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Only set up SSE routes if SSE transport is enabled
    if (this.config.transports.sse.enabled) {
      this.logger.info('Setting up SSE routes');

      // Create SSE routes
      const sseRoutes = createSseRoutes(this.transportService, this.logger);

      // Routes
      this.app.use(this.config.endpoints.sse, sseRoutes);

      // Also mount the messages endpoint at the root level for backward compatibility
      this.app.use(this.config.endpoints.messages, sseRoutes);
    } else {
      this.logger.info('SSE transport is disabled, skipping SSE routes setup');
    }
  }

  private setupErrorHandling(): void {
    const errorMiddleware = new ErrorMiddleware(this.logger);

    // Error handling
    this.app.use(errorMiddleware.notFound);
    this.app.use(errorMiddleware.errorHandler);
  }

  public getApp(): Express {
    return this.app;
  }
}
