// src/core/domain/models/transport-config.model.ts
export interface TransportConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

export interface TransportsConfig {
  sse: TransportConfig;
  stdio: TransportConfig;
}
