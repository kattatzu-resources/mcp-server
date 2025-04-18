// src/core/domain/models/server-config.model.ts
import { TransportsConfig } from './transport-config.model.js';

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
  transports: TransportsConfig;
}
