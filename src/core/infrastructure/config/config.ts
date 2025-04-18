import { ServerConfig } from '../../domain/models/server-config.model.js';
import { TransportsConfig } from '../../domain/models/transport-config.model.js';

export const config: ServerConfig = {
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    name: 'mcp-server',
    version: '1.0.0',
  },
  endpoints: {
    sse: '/sse',
    messages: '/messages',
  },
  transports: {
    sse: {
      enabled: process.env.ENABLE_SSE
        ? process.env.ENABLE_SSE === 'true'
        : true,
    },
    stdio: {
      enabled: process.env.ENABLE_STDIO
        ? process.env.ENABLE_STDIO === 'true'
        : true,
    },
  },
};
