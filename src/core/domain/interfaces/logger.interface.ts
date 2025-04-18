// src/core/domain/interfaces/logger.interface.ts
export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, error?: any, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}
