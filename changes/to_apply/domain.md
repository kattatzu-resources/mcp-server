// src/domain/interfaces/logger.interface.ts
export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: any, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// src/domain/interfaces/transport.interface.ts
import { Request, Response } from 'express';

export interface ITransport {
  readonly sessionId: string;
  start(): Promise<void>;
  close(): Promise<void>;
  handlePostMessage(req: Request, res: Response, body: any): Promise<void>;
  onclose?: () => void;
}

// src/domain/interfaces/tool.interface.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface ITool {
  register(server: McpServer): void;
}

// src/domain/interfaces/resource.interface.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface IResource {
  register(server: McpServer): void;
}

// src/domain/interfaces/prompt.interface.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface IPrompt {
  register(server: McpServer): void;
}

// src/domain/models/server-config.model.ts
export interface ServerConfig {
  server: {
    port: number;
    name: string;
    version: string;
  };
  endpoints: {
    sse: string;
    messages: string;
  };
}