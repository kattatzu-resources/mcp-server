// src/core/infrastructure/transport/sse-transport.adapter.ts
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Response } from 'express';
import { ITransport } from '../../domain/interfaces/transport.interface.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { config } from '../config/config.js';
import { TransportFactory } from './transport-factory.js';

export class SseTransportFactory extends TransportFactory {
  constructor(logger: ILogger) {
    super(logger);
  }

  public async createTransport(res: Response): Promise<ITransport> {
    this.logger.debug('Creating new SSE transport');
    // Use the root messages endpoint for compatibility
    const transport = new SSEServerTransport(
      config.endpoints.messages,
      res,
    ) as unknown as ITransport;

    this.logger.debug(
      `SSE transport created with session ID: ${transport.sessionId}`,
    );
    return transport;
  }
}
