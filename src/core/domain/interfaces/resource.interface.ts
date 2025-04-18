// src/core/domain/interfaces/resource.interface.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface IResource {
  register(server: McpServer): void;
}
