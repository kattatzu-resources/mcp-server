import { Router, Request, Response } from "express";
import { TransportManager } from "../../core/transport-manager.js";
import { createLogger } from "../../utils/logger.js";
import { HttpError } from "../middleware/error.middleware.js";

const logger = createLogger("SseRoutes");

/**
 * Create SSE routes
 */
export const createSseRoutes = (transportManager: TransportManager): Router => {
    const router = Router();

    /**
     * SSE endpoint for establishing the stream
     */
    router.get("/", async (req: Request, res: Response) => {
        logger.info("Received GET request to establish SSE stream");

        try {
            // Set headers for SSE
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // Create a new transport
            const transport = await transportManager.createTransport(res);

            // Start the SSE transport
            await transport.start();
            logger.info(`Established SSE stream with session ID: ${transport.sessionId}`);
        } catch (error) {
            logger.error("Error establishing SSE stream:", error);
            if (!res.headersSent) {
                res.status(500).send("Error establishing SSE stream");
            }
        }
    });

    /**
     * Messages endpoint for receiving client JSON-RPC requests
     * This can be mounted at different paths, so we use a generic handler
     */
    router.post("/", async (req: Request, res: Response) => {
        logger.info("Received POST request to /messages");

        // Handle ping message directly
        if (req.body && req.body.method === "ping") {
            logger.info("Received ping message, responding with pong");
            const timestamp = new Date().toISOString();
            res.json({
                jsonrpc: "2.0",
                result: {
                    status: "success",
                    message: `Pong! Server is alive at ${timestamp}`
                },
                id: req.body.id || null
            });
            return;
        }

        // Extract session ID from URL query parameter
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
            logger.error("No session ID provided in request URL");
            throw new HttpError("Missing sessionId parameter", 400);
        }

        const transport = transportManager.getTransport(sessionId);
        if (!transport) {
            logger.error(`No active transport found for session ID: ${sessionId}`);
            throw new HttpError("Session not found", 404);
        }

        try {
            // Handle the POST message with the transport
            await transport.handlePostMessage(req, res, req.body);
        } catch (error) {
            logger.error("Error handling request:", error);
            if (!res.headersSent) {
                throw new HttpError("Error handling request", 500);
            }
        }
    });

    return router;
};
