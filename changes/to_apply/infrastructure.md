// src/infrastructure/config/config.ts
import { ServerConfig } from "../../domain/models/server-config.model.js";

export const config: ServerConfig = {
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    name: "sse-mcp-server",
    version: "1.0.0",
  },
  endpoints: {
    sse: "/sse",
    messages: "/messages",
  }
};

// src/infrastructure/logging/console-logger.ts
import { ILogger } from "../../domain/interfaces/logger.interface.js";

export class ConsoleLogger implements ILogger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  public info(message: string, ...args: any[]): void {
    console.log(`[INFO] [${this.context}] ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] [${this.context}] ${message}`, ...args);
  }

  public error(message: string, error?: any, ...args: any[]): void {
    console.error(`[ERROR] [${this.context}] ${message}`, error || '', ...args);
  }

  public debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
    }
  }
}

export const createLogger = (context: string): ILogger => {
  return new ConsoleLogger(context);
};

// src/infrastructure/mcp/mcp-server.adapter.ts
// Este adaptador se usará si es necesario, pero no es crítico ahora

// src/infrastructure/transport/sse-transport.adapter.ts
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Response } from "express";
import { ITransport } from "../../domain/interfaces/transport.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { config } from "../config/config.js";

export class SseTransportFactory {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public async createTransport(res: Response): Promise<ITransport> {
    this.logger.debug("Creating new SSE transport");
    // Use the root messages endpoint for compatibility
    const transport = new SSEServerTransport(
      config.endpoints.messages, 
      res
    ) as unknown as ITransport;
    
    this.logger.debug(`SSE transport created with session ID: ${transport.sessionId}`);
    return transport;
  }
}