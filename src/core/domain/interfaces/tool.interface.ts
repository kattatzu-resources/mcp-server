// src/core/domain/interfaces/tool.interface.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ITool {
  register(server: McpServer): void;
}
