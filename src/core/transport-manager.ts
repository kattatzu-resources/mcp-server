import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Response } from "express";
import { config } from "../config/config.js";
import { createLogger } from "../utils/logger.js";
import { McpServerCore } from "./server.js";

const logger = createLogger("TransportManager");

/**
 * Manages SSE transports for the MCP server
 */
export class TransportManager {
    private transports: Record<string, SSEServerTransport> = {};
    private mcpServer: McpServerCore;

    constructor(mcpServer: McpServerCore) {
        this.mcpServer = mcpServer;
    }

    /**
     * Create a new SSE transport
     */
    public async createTransport(res: Response): Promise<SSEServerTransport> {
        // Create a new SSE transport for the client
        // Use the root messages endpoint for compatibility
        const transport = new SSEServerTransport("/messages", res);
        const sessionId = transport.sessionId;

        // Store the transport
        this.transports[sessionId] = transport;

        // Set up onclose handler
        transport.onclose = () => {
            logger.info(`SSE transport closed for session ${sessionId}`);
            this.removeTransport(sessionId);
        };

        // Connect the transport to the MCP server
        await this.mcpServer.connectTransport(transport);

        logger.info(`Created new transport with session ID: ${sessionId}`);
        return transport;
    }

    /**
     * Get a transport by session ID
     */
    public getTransport(sessionId: string): SSEServerTransport | undefined {
        return this.transports[sessionId];
    }

    /**
     * Remove a transport by session ID
     */
    public removeTransport(sessionId: string): void {
        delete this.transports[sessionId];
        logger.info(`Removed transport with session ID: ${sessionId}`);
    }

    /**
     * Close all transports
     */
    public async closeAllTransports(): Promise<void> {
        const sessionIds = Object.keys(this.transports);

        for (const sessionId of sessionIds) {
            try {
                logger.info(`Closing transport for session ${sessionId}`);
                await this.transports[sessionId].close();
                this.removeTransport(sessionId);
            } catch (error) {
                logger.error(`Error closing transport for session ${sessionId}:`, error);
            }
        }

        logger.info("All transports closed");
    }
}
