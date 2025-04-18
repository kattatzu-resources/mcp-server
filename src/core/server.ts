import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { config } from "../config/config.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("McpServer");

/**
 * Interface for MCP server capabilities
 */
export interface IMcpServerCapabilities {
    registerTools: () => void;
    registerResources: () => void;
    registerPrompts: () => void;
}

/**
 * Core MCP server class
 */
export class McpServerCore {
    private server: McpServer;
    private capabilities: IMcpServerCapabilities;

    constructor(capabilities: IMcpServerCapabilities) {
        this.capabilities = capabilities;

        // Create the MCP server instance
        this.server = new McpServer({
            name: config.server.name,
            version: config.server.version,
            capabilities: {
                resources: {},
                tools: {},
            },
        });

        logger.info("MCP Server created");
    }

    /**
     * Initialize the server with all capabilities
     */
    public initialize(): void {
        // Register all capabilities
        this.capabilities.registerTools();
        this.capabilities.registerResources();
        this.capabilities.registerPrompts();

        logger.info("MCP Server initialized with all capabilities");
    }

    /**
     * Connect a transport to the server
     */
    public async connectTransport(transport: SSEServerTransport): Promise<void> {
        await this.server.connect(transport);
        logger.info(`Transport connected: ${transport.sessionId}`);
    }

    /**
     * Get the MCP server instance
     */
    public getServer(): McpServer {
        return this.server;
    }

    /**
     * Close the server
     */
    public async close(): Promise<void> {
        await this.server.close();
        logger.info("MCP Server closed");
    }
}
