// src/tools/math/sum.tool.ts
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ITool } from '../../core/domain/interfaces/tool.interface.js';
import { ILogger } from '../../core/domain/interfaces/logger.interface.js';

export class SumTool implements ITool {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.tool(
      'sum',
      'Return the sum of two numbers',
      {
        number1: z.string().describe('First number'),
        number2: z.string().describe('Second number'),
      },
      async ({ number1, number2 }) => {
        this.logger.info(`Calculating sum of ${number1} + ${number2}`);

        const sum = parseInt(number1) + parseInt(number2);

        return {
          content: [
            {
              type: 'text',
              text: `La suma de ${number1} + ${number2} = ${sum}`,
            },
          ],
        };
      },
    );

    this.logger.info('Sum tool registered');
  }
}
