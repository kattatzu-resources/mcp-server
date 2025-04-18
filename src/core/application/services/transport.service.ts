// src/core/application/services/transport.service.ts
import { Response } from 'express';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { ITransport } from '../../domain/interfaces/transport.interface.js';
import { ITransportFactory } from '../../infrastructure/transport/transport-factory.js';

export class TransportService {
  private transports: Record<string, ITransport> = {};
  private readonly logger: ILogger;
  private readonly transportFactories: {
    sse?: ITransportFactory;
    stdio?: ITransportFactory;
  };
  private readonly onTransportConnected: (
    transport: ITransport,
  ) => Promise<void>;

  constructor(
    logger: ILogger,
    transportFactories: {
      sse?: ITransportFactory;
      stdio?: ITransportFactory;
    },
    onTransportConnected: (transport: ITransport) => Promise<void>,
  ) {
    this.logger = logger;
    this.transportFactories = transportFactories;
    this.onTransportConnected = onTransportConnected;
  }

  public async createSseTransport(res: Response): Promise<ITransport> {
    if (!this.transportFactories.sse) {
      throw new Error('SSE transport factory not available');
    }

    const transport = await this.transportFactories.sse.createTransport(res);
    return this.setupTransport(transport);
  }

  public async createStdioTransport(): Promise<ITransport> {
    if (!this.transportFactories.stdio) {
      throw new Error('STDIO transport factory not available');
    }

    const transport = await this.transportFactories.stdio.createTransport();
    return this.setupTransport(transport);
  }

  private async setupTransport(transport: ITransport): Promise<ITransport> {
    const sessionId = transport.sessionId;

    this.transports[sessionId] = transport;

    transport.onclose = () => {
      this.logger.info(`Transport closed for session ${sessionId}`);
      this.removeTransport(sessionId);
    };

    await this.onTransportConnected(transport);

    try {
      // Some transports (like StdioServerTransport) are automatically started by connect()
      // Only try to start if not already started
      await transport.start();
    } catch (error) {
      // If the transport is already started, log it but continue
      if (error instanceof Error && error.message.includes('already started')) {
        this.logger.debug(
          `Transport ${sessionId} was already started by connect()`,
        );
      } else {
        // Re-throw if it's a different error
        throw error;
      }
    }

    this.logger.info(`Created new transport with session ID: ${sessionId}`);
    return transport;
  }

  public getTransport(sessionId: string): ITransport | undefined {
    return this.transports[sessionId];
  }

  public removeTransport(sessionId: string): void {
    delete this.transports[sessionId];
    this.logger.info(`Removed transport with session ID: ${sessionId}`);
  }

  public async closeAllTransports(): Promise<void> {
    const sessionIds = Object.keys(this.transports);

    for (const sessionId of sessionIds) {
      try {
        this.logger.info(`Closing transport for session ${sessionId}`);
        await this.transports[sessionId].close();
        this.removeTransport(sessionId);
      } catch (error) {
        this.logger.error(
          `Error closing transport for session ${sessionId}:`,
          error,
        );
      }
    }

    this.logger.info('All transports closed');
  }
}
