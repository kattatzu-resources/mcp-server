import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../utils/logger.js";
import { registerConversationPrompt } from "./chat/conversation.prompt.js";

const logger = createLogger("Prompts");

/**
 * Register all prompts with the MCP server
 */
export const registerAllPrompts = (server: McpServer): void => {
    logger.info("Registering all prompts...");

    // Chat prompts
    registerConversationPrompt(server);

    logger.info("All prompts registered successfully");
};
