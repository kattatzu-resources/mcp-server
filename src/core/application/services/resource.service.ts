// src/core/application/services/resource.service.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { IResource } from '../../domain/interfaces/resource.interface.js';

export class ResourceService {
  private readonly resources: IResource[];
  private readonly logger: ILogger;

  constructor(resources: IResource[], logger: ILogger) {
    this.resources = resources;
    this.logger = logger;
  }

  public registerAll(server: McpServer): void {
    this.logger.info('Registering all resources...');

    for (const resource of this.resources) {
      resource.register(server);
    }

    this.logger.info('All resources registered successfully');
  }
}
