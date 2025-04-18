import express, { Express } from "express";
import { config } from "../config/config.js";
import { TransportManager } from "../core/transport-manager.js";
import { createLogger } from "../utils/logger.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";
import { createSseRoutes } from "./routes/sse.routes.js";

const logger = createLogger("API");

/**
 * Create and configure the Express application
 */
export const createExpressApp = (transportManager: TransportManager): Express => {
    const app = express();

    // Middleware
    app.use(express.json());

    // Create SSE routes
    const sseRoutes = createSseRoutes(transportManager);

    // Routes
    app.use(config.endpoints.sse, sseRoutes);

    // Also mount the messages endpoint at the root level for backward compatibility
    app.use(config.endpoints.messages, sseRoutes);

    // Error handling
    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
};

/**
 * Start the Express server
 */
export const startServer = (app: Express): void => {
    const PORT = config.server.port;

    app.listen(PORT, () => {
        logger.info(`MCP Server running on SSE at http://localhost:${PORT}${config.endpoints.sse}`);
    });

    // Handle server shutdown
    process.on("SIGINT", () => {
        logger.info("Received SIGINT signal");
        process.exit(0);
    });

    process.on("SIGTERM", () => {
        logger.info("Received SIGTERM signal");
        process.exit(0);
    });
};
