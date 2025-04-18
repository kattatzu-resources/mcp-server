import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ServerConfig } from "../../domain/models/server-config.model.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ServerUseCase } from "../usecases/server.usecase.js";
import { ToolService } from "../services/tool.service.js";
import { ResourceService } from "../services/resource.service.js";
import { PromptService } from "../services/prompt.service.js";
import { TransportService } from "../services/transport.service.js";
import { ITool } from "../../domain/interfaces/tool.interface.js";
import { IResource } from "../../domain/interfaces/resource.interface.js";
import { IPrompt } from "../../domain/interfaces/prompt.interface.js";
import { Response } from "express";
import { ITransport } from "../../domain/interfaces/transport.interface.js";

export class ServerFactory {
    private readonly config: ServerConfig;
    private readonly logger: ILogger;
    private readonly tools: ITool[];
    private readonly resources: IResource[];
    private readonly prompts: IPrompt[];
    private readonly transportFactory: (res: Response) => Promise<ITransport>;

    constructor(
        config: ServerConfig,
        logger: ILogger,
        tools: ITool[],
        resources: IResource[],
        prompts: IPrompt[],
        transportFactory: (res: Response) => Promise<ITransport>
    ) {
        this.config = config;
        this.logger = logger;
        this.tools = tools;
        this.resources = resources;
        this.prompts = prompts;
        this.transportFactory = transportFactory;
    }

    public createServer(): {
        serverUseCase: ServerUseCase;
        transportService: TransportService;
    } {
        this.logger.info("Creating MCP Server");

        // Create MCP server instance
        const server = new McpServer({
            name: this.config.server.name,
            version: this.config.server.version,
            capabilities: {
                resources: {},
                tools: {},
            },
        });

        // Create services
        const toolService = new ToolService(this.tools, this.logger);
        const resourceService = new ResourceService(this.resources, this.logger);
        const promptService = new PromptService(this.prompts, this.logger);

        // Create use case
        const serverUseCase = new ServerUseCase(
            server,
            toolService,
            resourceService,
            promptService,
            this.logger
        );

        // Create transport service
        const transportService = new TransportService(
            this.logger,
            this.transportFactory,
            (transport) => serverUseCase.connectTransport(transport)
        );

        return {
            serverUseCase,
            transportService,
        };
    }
}
