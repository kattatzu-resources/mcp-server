#!/usr/bin/env node
import { createLogger } from './core/infrastructure/logging/console-logger.js';
import { config } from './core/infrastructure/config/config.js';
import { createTools } from './tools/index.js';
import { createResources } from './resources/index.js';
import { createPrompts } from './prompts/index.js';
import { ServerFactory } from './core/application/factories/server.factory.js';
import { SseTransportFactory } from './core/infrastructure/transport/sse-transport.adapter.js';
import { StdioTransportFactory } from './core/infrastructure/transport/stdio-transport.adapter.js';
import { ExpressApp } from './core/presentation/api/app.js';
import { HttpServer } from './core/presentation/api/server.js';

/**
 * Main application entry point
 */
async function main() {
  // If STDIO transport is enabled, disable console logging to prevent interference
  if (config.transports.stdio.enabled) {
    process.env.MCP_DISABLE_CONSOLE_LOGGING = 'true';
  }

  const mainLogger = createLogger('Main');

  try {
    mainLogger.info('Starting MCP Server...');

    // Create logger instances for each component
    const toolsLogger = createLogger('Tools');
    const resourcesLogger = createLogger('Resources');
    const promptsLogger = createLogger('Prompts');
    const transportLogger = createLogger('Transport');
    const serverLogger = createLogger('Server');

    // Create core components
    const tools = createTools(toolsLogger);
    const resources = createResources(resourcesLogger);
    const prompts = createPrompts(promptsLogger);

    // Create transport factories based on configuration
    const transportFactories: {
      sse?: SseTransportFactory;
      stdio?: StdioTransportFactory;
    } = {};

    if (config.transports.sse.enabled) {
      mainLogger.info('SSE transport enabled');
      transportFactories.sse = new SseTransportFactory(transportLogger);
    }

    if (config.transports.stdio.enabled) {
      mainLogger.info('STDIO transport enabled');
      transportFactories.stdio = new StdioTransportFactory(transportLogger);
    }

    // Create server factory
    const serverFactory = new ServerFactory(
      config,
      serverLogger,
      tools,
      resources,
      prompts,
      transportFactories,
    );

    // Create server and transport service
    const { serverUseCase, transportService } = serverFactory.createServer();

    // Initialize MCP server with all capabilities
    serverUseCase.initialize();

    // Create STDIO transport if enabled
    if (config.transports.stdio.enabled) {
      try {
        await transportService.createStdioTransport();
        mainLogger.info('STDIO transport created successfully');
      } catch (error) {
        mainLogger.error('Error creating STDIO transport:', error);
      }
    }

    // Only start HTTP server if SSE is enabled
    if (config.transports.sse.enabled) {
      // Create and start Express app
      const apiLogger = createLogger('API');
      const expressApp = new ExpressApp(config, transportService, apiLogger);
      const httpServer = new HttpServer(
        expressApp.getApp(),
        config,
        apiLogger,
        transportService,
        serverUseCase,
      );

      // Start HTTP server
      httpServer.start();
    } else {
      mainLogger.info('SSE transport disabled, HTTP server not started');
    }

    mainLogger.info('MCP Server started successfully');
  } catch (error) {
    mainLogger.error('Fatal error in main():', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
