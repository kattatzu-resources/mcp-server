// src/prompts/index.ts
import { ILogger } from '../core/domain/interfaces/logger.interface.js';
import { IPrompt } from '../core/domain/interfaces/prompt.interface.js';
import { ConversationPrompt } from './conversation.prompt.js';

export const createPrompts = (logger: ILogger): IPrompt[] => {
  return [new ConversationPrompt(logger)];
};
