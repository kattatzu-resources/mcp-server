// src/core/infrastructure/transport/transport-factory.ts
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { ITransport } from '../../domain/interfaces/transport.interface.js';

export interface ITransportFactory {
  createTransport(...args: any[]): Promise<ITransport>;
}

export abstract class TransportFactory implements ITransportFactory {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  abstract createTransport(...args: any[]): Promise<ITransport>;
}
