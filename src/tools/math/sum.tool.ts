import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("SumTool");

/**
 * Register the sum function tool
 */
export const registerSumTool = (server: McpServer): void => {
    server.tool(
        "sum",
        "Return the sum of two numbers",
        {
            number1: z.string().describe("First number"),
            number2: z.string().describe("Second number"),
        },
        async ({ number1, number2 }) => {
            logger.info(`Calculating sum of ${number1} + ${number2}`);

            const sum = parseInt(number1) + parseInt(number2);

            return {
                content: [
                    {
                        type: "text",
                        text: `La suma de ${number1} + ${number2} = ${sum}`,
                    },
                ],
            };
        },
    );

    logger.info("Sum tool registered");
};
