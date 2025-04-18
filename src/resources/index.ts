// src/resources/index.ts
import { ILogger } from '../core/domain/interfaces/logger.interface.js';
import { IResource } from '../core/domain/interfaces/resource.interface.js';
import { GreetingResource } from './greeting.resource.js';
import { WeatherResource } from './weather.resource.js';

export const createResources = (logger: ILogger): IResource[] => {
  return [new GreetingResource(logger), new WeatherResource(logger)];
};
