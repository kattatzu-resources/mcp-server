// src/tools/index.ts
import { ILogger } from '../core/domain/interfaces/logger.interface.js';
import { ITool } from '../core/domain/interfaces/tool.interface.js';
import { SumTool } from './math/sum.tool.js';
import { PingTool } from './system/ping.tool.js';

export const createTools = (logger: ILogger): ITool[] => {
  return [new SumTool(logger), new PingTool(logger)];
};
