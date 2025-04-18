// src/resources/weather.resource.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { IResource } from '../core/domain/interfaces/resource.interface.js';
import { ILogger } from '../core/domain/interfaces/logger.interface.js';

export class WeatherResource implements IResource {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    const weatherData = {
      santiago: {
        temperature: 22,
        condition: 'Soleado',
        humidity: 45,
        wind: 10,
      },
      buenosAires: {
        temperature: 25,
        condition: 'Parcialmente nublado',
        humidity: 60,
        wind: 15,
      },
      lima: {
        temperature: 20,
        condition: 'Nublado',
        humidity: 75,
        wind: 8,
      },
    };

    server.resource('weather', 'weather.json', async () => {
      this.logger.info('Weather resource accessed');

      return {
        contents: [
          {
            uri: 'weather.json',
            text: JSON.stringify(weatherData, null, 2),
            mimeType: 'application/json',
          },
        ],
      };
    });

    this.logger.info('Weather resource registered');
  }
}
