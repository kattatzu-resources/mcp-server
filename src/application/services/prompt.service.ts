import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { IPrompt } from "../../domain/interfaces/prompt.interface.js";

export class PromptService {
    private readonly prompts: IPrompt[];
    private readonly logger: ILogger;

    constructor(prompts: IPrompt[], logger: ILogger) {
        this.prompts = prompts;
        this.logger = logger;
    }

    public registerAll(server: McpServer): void {
        this.logger.info("Registering all prompts...");

        for (const prompt of this.prompts) {
            prompt.register(server);
        }

        this.logger.info("All prompts registered successfully");
    }
}
