import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("GreetingResource");

/**
 * Register a simple greeting text resource
 */
export const registerGreetingResource = (server: McpServer): void => {
    server.resource(
        "greeting",
        "greeting.txt",
        async () => {
            logger.info("Greeting resource accessed");

            return {
                contents: [
                    {
                        uri: "greeting.txt",
                        text: "¡Hola! Bienvenido al servidor MCP. Este es un recurso de texto simple.",
                        mimeType: "text/plain",
                    },
                ],
            };
        }
    );

    logger.info("Greeting resource registered");
};
