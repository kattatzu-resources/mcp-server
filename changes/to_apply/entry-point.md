#!/usr/bin/env node
// src/index.ts
import { createLogger } from "./infrastructure/logging/console-logger.js";
import { config } from "./infrastructure/config/config.js";
import { createTools } from "./infrastructure/tools/index.js";
import { createResources } from "./infrastructure/resources/index.js";
import { createPrompts } from "./infrastructure/prompts/index.js";
import { ServerFactory } from "./application/factories/server.factory.js";
import { SseTransportFactory } from "./infrastructure/transport/sse-transport.adapter.js";
import { ExpressApp } from "./presentation/api/app.js";
import { HttpServer } from "./presentation/api/server.js";

/**
 * Main application entry point
 */
async function main() {
  const mainLogger = createLogger("Main");
  
  try {
    mainLogger.info("Starting MCP SSE Server...");
    
    // Create logger instances for each component
    const toolsLogger = createLogger("Tools");
    const resourcesLogger = createLogger("Resources");
    const promptsLogger = createLogger("Prompts");
    const transportLogger = createLogger("Transport");
    const serverLogger = createLogger("Server");
    
    // Create core components
    const tools = createTools(toolsLogger);
    const resources = createResources(resourcesLogger);
    const prompts = createPrompts(promptsLogger);
    
    // Create transport factory
    const transportFactory = new SseTransportFactory(transportLogger);
    
    // Create server factory
    const serverFactory = new ServerFactory(
      config,
      serverLogger,
      tools,
      resources,
      prompts,
      transportFactory.createTransport.bind(transportFactory)
    );
    
    // Create server and transport service
    const { serverUseCase, transportService } = serverFactory.createServer();
    
    // Initialize MCP server with all capabilities
    serverUseCase.initialize();
    
    // Create and start Express app
    const apiLogger = createLogger("API");
    const expressApp = new ExpressApp(config, transportService, apiLogger);
    const httpServer = new HttpServer(
      expressApp.getApp(),
      config,
      apiLogger,
      transportService,
      serverUseCase
    );
    
    // Start HTTP server
    httpServer.start();
    
    mainLogger.info("MCP SSE Server started successfully");
  } catch (error) {
    mainLogger.error("Fatal error in main():", error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});