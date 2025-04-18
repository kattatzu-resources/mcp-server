import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface IPrompt {
  register(server: McpServer): void;
}
