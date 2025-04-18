import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ITool } from "../../domain/interfaces/tool.interface.js";

export class ToolService {
    private readonly tools: ITool[];
    private readonly logger: ILogger;

    constructor(tools: ITool[], logger: ILogger) {
        this.tools = tools;
        this.logger = logger;
    }

    public registerAll(server: McpServer): void {
        this.logger.info("Registering all tools...");

        for (const tool of this.tools) {
            tool.register(server);
        }

        this.logger.info("All tools registered successfully");
    }
}
