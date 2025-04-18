import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../utils/logger.js";
import { registerAllTools } from "../tools/index.js";
import { registerAllResources } from "../resources/index.js";
import { registerAllPrompts } from "../prompts/index.js";
import { IMcpServerCapabilities } from "./server.js";

const logger = createLogger("Capabilities");

/**
 * Implementation of MCP server capabilities
 */
export class McpServerCapabilities implements IMcpServerCapabilities {
    private server: McpServer;

    constructor(server: McpServer) {
        this.server = server;
        logger.info("MCP Server capabilities initialized");
    }

    /**
     * Register all tools
     */
    public registerTools(): void {
        registerAllTools(this.server);
    }

    /**
     * Register all resources
     */
    public registerResources(): void {
        registerAllResources(this.server);
    }

    /**
     * Register all prompts
     */
    public registerPrompts(): void {
        registerAllPrompts(this.server);
    }
}
