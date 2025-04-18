import { Express } from 'express';
import { ServerConfig } from '../../domain/models/server-config.model.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { TransportService } from '../../application/services/transport.service.js';
import { ServerUseCase } from '../../application/usecases/server.usecase.js';

export class HttpServer {
  private readonly app: Express;
  private readonly config: ServerConfig;
  private readonly logger: ILogger;
  private readonly transportService: TransportService;
  private readonly serverUseCase: ServerUseCase;

  constructor(
    app: Express,
    config: ServerConfig,
    logger: ILogger,
    transportService: TransportService,
    serverUseCase: ServerUseCase,
  ) {
    this.app = app;
    this.config = config;
    this.logger = logger;
    this.transportService = transportService;
    this.serverUseCase = serverUseCase;
    this.setupShutdownHandlers();
  }

  public start(): void {
    const PORT = this.config.server.port;

    this.app.listen(PORT, () => {
      this.logger.info(
        `MCP Server running on SSE at http://localhost:${PORT}${this.config.endpoints.sse}`,
      );
    });
  }

  private setupShutdownHandlers(): void {
    // Handle server shutdown
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info('Shutting down server...');

    try {
      // Close all active transports
      await this.transportService.closeAllTransports();

      // Close MCP server
      await this.serverUseCase.close();

      this.logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}
