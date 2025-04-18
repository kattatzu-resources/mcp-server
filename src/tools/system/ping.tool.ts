import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("PingTool");

/**
 * Register the ping tool
 */
export const registerPingTool = (server: McpServer): void => {
    server.tool(
        "ping",
        "Respond to ping requests with a pong message",
        {
            message: z.string().optional().describe("Optional message to include in the response"),
        },
        async ({ message }) => {
            const timestamp = new Date().toISOString();
            const responseMessage = message
                ? `Pong! Received: "${message}" at ${timestamp}`
                : `Pong! Server is alive at ${timestamp}`;

            logger.info(`Ping received, responding with: ${responseMessage}`);

            return {
                content: [
                    {
                        type: "text",
                        text: responseMessage,
                    },
                ],
            };
        },
    );

    logger.info("Ping tool registered");
};
