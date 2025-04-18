#!/usr/bin/env node
import { createLogger } from "./utils/logger.js";
import { McpServerCore } from "./core/server.js";
import { McpServerCapabilities } from "./core/capabilities.js";
import { TransportManager } from "./core/transport-manager.js";
import { createExpressApp, startServer } from "./api/api.js";

const logger = createLogger("Main");

/**
 * Main application entry point
 */
async function main() {
    try {
        logger.info("Starting MCP SSE Server...");

        // Create server capabilities
        const capabilities = new McpServerCapabilities(null as any); // Will be set after server creation

        // Create MCP server
        const mcpServer = new McpServerCore(capabilities);

        // Set the server in capabilities
        (capabilities as any).server = mcpServer.getServer();

        // Initialize the server with all capabilities
        mcpServer.initialize();

        // Create transport manager
        const transportManager = new TransportManager(mcpServer);

        // Create and start Express app
        const app = createExpressApp(transportManager);
        startServer(app);

        // Handle server shutdown
        process.on("SIGINT", async () => {
            logger.info("Shutting down server...");

            // Close all active transports
            await transportManager.closeAllTransports();

            // Close MCP server
            await mcpServer.close();

            logger.info("Server shutdown complete");
            process.exit(0);
        });

        logger.info("MCP SSE Server started successfully");
    } catch (error) {
        logger.error("Fatal error in main():", error);
        process.exit(1);
    }
}

// Start the application
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
