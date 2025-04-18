import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../utils/logger.js";
import { registerGreetingResource } from "./text/greeting.resource.js";
import { registerWeatherResource } from "./data/weather.resource.js";

const logger = createLogger("Resources");

/**
 * Register all resources with the MCP server
 */
export const registerAllResources = (server: McpServer): void => {
    logger.info("Registering all resources...");

    // Text resources
    registerGreetingResource(server);

    // Data resources
    registerWeatherResource(server);

    logger.info("All resources registered successfully");
};
