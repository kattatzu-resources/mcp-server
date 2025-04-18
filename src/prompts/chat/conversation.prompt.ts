import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ConversationPrompt");

/**
 * Register a conversation prompt
 */
export const registerConversationPrompt = (server: McpServer): void => {
    server.prompt(
        "conversation",
        "A prompt for having a conversation in Spanish",
        () => {
            logger.info("Conversation prompt accessed");

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: "Actúa como un asistente amable y útil que responde en español. Siempre sé educado y trata de proporcionar información precisa y útil. Si no sabes algo, admítelo en lugar de inventar información."
                        }
                    },
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text: "¡Hola! Soy tu asistente en español. Estoy aquí para ayudarte con cualquier pregunta o tarea que tengas. ¿Cómo puedo ayudarte hoy?"
                        }
                    }
                ]
            };
        }
    );

    logger.info("Conversation prompt registered");
};
