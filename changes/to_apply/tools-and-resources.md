// src/infrastructure/tools/math/sum.tool.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITool } from "../../../domain/interfaces/tool.interface.js";
import { ILogger } from "../../../domain/interfaces/logger.interface.js";

export class SumTool implements ITool {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.tool(
      "sum",
      "Return the sum of two numbers",
      {
        number1: z.string().describe("First number"),
        number2: z.string().describe("Second number"),
      },
      async ({ number1, number2 }) => {
        this.logger.info(`Calculating sum of ${number1} + ${number2}`);

        const sum = parseInt(number1) + parseInt(number2);

        return {
          content: [
            {
              type: "text",
              text: `La suma de ${number1} + ${number2} = ${sum}`,
            },
          ],
        };
      },
    );

    this.logger.info("Sum tool registered");
  }
}

// src/infrastructure/tools/system/ping.tool.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITool } from "../../../domain/interfaces/tool.interface.js";
import { ILogger } from "../../../domain/interfaces/logger.interface.js";

export class PingTool implements ITool {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.tool(
      "ping",
      "Respond to ping requests with a pong message",
      {
        message: z.string().optional().describe("Optional message to include in the response"),
      },
      async ({ message }) => {
        const timestamp = new Date().toISOString();
        const responseMessage = message
          ? `Pong! Received: "${message}" at ${timestamp}`
          : `Pong! Server is alive at ${timestamp}`;

        this.logger.info(`Ping received, responding with: ${responseMessage}`);

        return {
          content: [
            {
              type: "text",
              text: responseMessage,
            },
          ],
        };
      },
    );

    this.logger.info("Ping tool registered");
  }
}

// src/infrastructure/tools/index.ts
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ITool } from "../../domain/interfaces/tool.interface.js";
import { SumTool } from "./math/sum.tool.js";
import { PingTool } from "./system/ping.tool.js";

export const createTools = (logger: ILogger): ITool[] => {
  return [
    new SumTool(logger),
    new PingTool(logger),
  ];
};

// src/infrastructure/resources/greeting.resource.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IResource } from "../../domain/interfaces/resource.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";

export class GreetingResource implements IResource {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.resource(
      "greeting",
      "greeting.txt",
      async () => {
        this.logger.info("Greeting resource accessed");

        return {
          contents: [
            {
              uri: "greeting.txt",
              text: "¡Hola! Bienvenido al servidor MCP. Este es un recurso de texto simple.",
              mimeType: "text/plain",
            },
          ],
        };
      }
    );

    this.logger.info("Greeting resource registered");
  }
}

// src/infrastructure/resources/weather.resource.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IResource } from "../../domain/interfaces/resource.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";

export class WeatherResource implements IResource {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    const weatherData = {
      santiago: {
        temperature: 22,
        condition: "Soleado",
        humidity: 45,
        wind: 10,
      },
      buenosAires: {
        temperature: 25,
        condition: "Parcialmente nublado",
        humidity: 60,
        wind: 15,
      },
      lima: {
        temperature: 20,
        condition: "Nublado",
        humidity: 75,
        wind: 8,
      },
    };

    server.resource(
      "weather",
      "weather.json",
      async () => {
        this.logger.info("Weather resource accessed");

        return {
          contents: [
            {
              uri: "weather.json",
              text: JSON.stringify(weatherData, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      }
    );

    this.logger.info("Weather resource registered");
  }
}

// src/infrastructure/resources/index.ts
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { IResource } from "../../domain/interfaces/resource.interface.js";
import { GreetingResource } from "./greeting.resource.js";
import { WeatherResource } from "./weather.resource.js";

export const createResources = (logger: ILogger): IResource[] => {
  return [
    new GreetingResource(logger),
    new WeatherResource(logger),
  ];
};

// src/infrastructure/prompts/conversation.prompt.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IPrompt } from "../../domain/interfaces/prompt.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";

export class ConversationPrompt implements IPrompt {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public register(server: McpServer): void {
    server.prompt(
      "conversation",
      "A prompt for having a conversation in Spanish",
      () => {
        this.logger.info("Conversation prompt accessed");

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: "Actúa como un asistente amable y útil que responde en español. Siempre sé educado y trata de proporcionar información precisa y útil. Si no sabes algo, admítelo en lugar de inventar información."
              }
            },
            {
              role: "assistant",
              content: {
                type: "text",
                text: "¡Hola! Soy tu asistente en español. Estoy aquí para ayudarte con cualquier pregunta o tarea que tengas. ¿Cómo puedo ayudarte hoy?"
              }
            }
          ]
        };
      }
    );

    this.logger.info("Conversation prompt registered");
  }
}

// src/infrastructure/prompts/index.ts
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { IPrompt } from "../../domain/interfaces/prompt.interface.js";
import { ConversationPrompt } from "./conversation.prompt.js";

export const createPrompts = (logger: ILogger): IPrompt[] => {
  return [
    new ConversationPrompt(logger),
  ];
};