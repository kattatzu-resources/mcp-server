// src/resources/greeting.resource.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { IResource } from '../core/domain/interfaces/resource.interface.js';
import { ILogger } from '../core/domain/interfaces/logger.interface.js';

export class GreetingResource implements IResource {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.resource('greeting', 'greeting.txt', async () => {
      this.logger.info('Greeting resource accessed');

      return {
        contents: [
          {
            uri: 'greeting.txt',
            text: '¡Hola! Bienvenido al servidor MCP. Este es un recurso de texto simple.',
            mimeType: 'text/plain',
          },
        ],
      };
    });

    this.logger.info('Greeting resource registered');
  }
}
