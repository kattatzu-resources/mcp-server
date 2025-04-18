// src/tools/system/ping.tool.ts
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ITool } from '../../core/domain/interfaces/tool.interface.js';
import { ILogger } from '../../core/domain/interfaces/logger.interface.js';

export class PingTool implements ITool {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.tool(
      'ping',
      'Respond to ping requests with a pong message',
      {
        message: z
          .string()
          .optional()
          .describe('Optional message to include in the response'),
      },
      async ({ message }) => {
        const timestamp = new Date().toISOString();
        const responseMessage = message
          ? `Pong! Received: "${message}" at ${timestamp}`
          : `Pong! Server is alive at ${timestamp}`;

        this.logger.info(`Ping received, responding with: ${responseMessage}`);

        return {
          content: [
            {
              type: 'text',
              text: responseMessage,
            },
          ],
        };
      },
    );

    this.logger.info('Ping tool registered');
  }
}
