import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../utils/logger.js";
import { registerSumTool } from "./math/sum.tool.js";
import { registerPingTool } from "./system/ping.tool.js";

const logger = createLogger("Tools");

/**
 * Register all tools with the MCP server
 */
export const registerAllTools = (server: McpServer): void => {
    logger.info("Registering all tools...");

    // Math tools
    registerSumTool(server);

    // System tools
    registerPingTool(server);

    logger.info("All tools registered successfully");
};
