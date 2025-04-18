import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { registerSumFunction } from "./tools/sum.tool.js";

// Instance a new MCP Server
const server = new McpServer({
    name: "sse-mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

// Register tools
registerSumFunction(server);

// Store transports by session ID
const transports: Record<string, SSEServerTransport> = {};

async function main() {
    const app = express();
    app.use(express.json());

    // SSE endpoint for establishing the stream
    app.get('/sse', async (req, res) => {
        console.log('Received GET request to /sse (establishing SSE stream)');
        try {
            // Create a new SSE transport for the client
            // The endpoint for POST messages is '/messages'
            const transport = new SSEServerTransport('/messages', res);

            // Store the transport by session ID
            const sessionId = transport.sessionId;
            transports[sessionId] = transport;

            // Set up onclose handler to clean up transport when closed
            transport.onclose = () => {
                console.log(`SSE transport closed for session ${sessionId}`);
                delete transports[sessionId];
            };

            // Connect the transport to the MCP server
            await server.connect(transport);

            // Start the SSE transport to begin streaming
            await transport.start();
            console.log(`Established SSE stream with session ID: ${sessionId}`);
        } catch (error) {
            console.error('Error establishing SSE stream:', error);
            if (!res.headersSent) {
                res.status(500).send('Error establishing SSE stream');
            }
        }
    });

    // Messages endpoint for receiving client JSON-RPC requests
    app.post('/messages', async (req, res) => {
        console.log('Received POST request to /messages');

        // Extract session ID from URL query parameter
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
            console.error('No session ID provided in request URL');
            res.status(400).send('Missing sessionId parameter');
            return;
        }

        const transport = transports[sessionId];
        if (!transport) {
            console.error(`No active transport found for session ID: ${sessionId}`);
            res.status(404).send('Session not found');
            return;
        }

        try {
            // Handle the POST message with the transport
            await transport.handlePostMessage(req, res, req.body);
        } catch (error) {
            console.error('Error handling request:', error);
            if (!res.headersSent) {
                res.status(500).send('Error handling request');
            }
        }
    });

    // Start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`MCP Server running on SSE at http://localhost:${PORT}/sse`);
    });

    // Handle server shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down server...');
        // Close all active transports to properly clean up resources
        for (const sessionId in transports) {
            try {
                console.log(`Closing transport for session ${sessionId}`);
                await transports[sessionId].close();
                delete transports[sessionId];
            } catch (error) {
                console.error(`Error closing transport for session ${sessionId}:`, error);
            }
        }
        await server.close();
        console.log('Server shutdown complete');
        process.exit(0);
    });
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
