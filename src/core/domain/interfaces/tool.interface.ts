import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ITool {
  register(server: McpServer): void;
}
