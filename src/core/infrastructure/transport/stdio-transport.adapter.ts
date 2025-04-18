// src/core/infrastructure/transport/stdio-transport.adapter.ts
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ITransport } from '../../domain/interfaces/transport.interface.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { TransportFactory } from './transport-factory.js';

export class StdioTransportFactory extends TransportFactory {
  constructor(logger: ILogger) {
    super(logger);
  }

  public async createTransport(): Promise<ITransport> {
    this.logger.debug('Creating new STDIO transport');

    // Create the STDIO transport
    const transport = new StdioServerTransport() as unknown as ITransport;

    this.logger.debug(
      `STDIO transport created with session ID: ${transport.sessionId}`,
    );
    return transport;
  }
}
