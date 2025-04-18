// src/core/infrastructure/logging/console-logger.ts
import { ILogger } from '../../domain/interfaces/logger.interface.js';

export class ConsoleLogger implements ILogger {
  private readonly context: string;
  private readonly shouldLog: boolean;

  constructor(context: string) {
    this.context = context;
    // Check if we should disable console logging (e.g., when STDIO transport is active)
    this.shouldLog = process.env.MCP_DISABLE_CONSOLE_LOGGING !== 'true';
  }

  public info(message: string, ...args: any[]): void {
    if (this.shouldLog) {
      console.log(`[INFO] [${this.context}] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog) {
      console.warn(`[WARN] [${this.context}] ${message}`, ...args);
    }
  }

  public error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog) {
      console.error(
        `[ERROR] [${this.context}] ${message}`,
        error || '',
        ...args,
      );
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog && process.env.DEBUG) {
      console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
    }
  }
}

export const createLogger = (context: string): ILogger => {
  return new ConsoleLogger(context);
};
