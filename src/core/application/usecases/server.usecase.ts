// src/core/application/usecases/server.usecase.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ILogger } from '../../domain/interfaces/logger.interface.js';
import { ITransport } from '../../domain/interfaces/transport.interface.js';
import { ToolService } from '../services/tool.service.js';
import { ResourceService } from '../services/resource.service.js';
import { PromptService } from '../services/prompt.service.js';

export class ServerUseCase {
  private readonly server: McpServer;
  private readonly toolService: ToolService;
  private readonly resourceService: ResourceService;
  private readonly promptService: PromptService;
  private readonly logger: ILogger;

  constructor(
    server: McpServer,
    toolService: ToolService,
    resourceService: ResourceService,
    promptService: PromptService,
    logger: ILogger,
  ) {
    this.server = server;
    this.toolService = toolService;
    this.resourceService = resourceService;
    this.promptService = promptService;
    this.logger = logger;
  }

  public initialize(): void {
    this.logger.info('Initializing MCP Server with all capabilities');

    // Register all capabilities
    this.toolService.registerAll(this.server);
    this.resourceService.registerAll(this.server);
    this.promptService.registerAll(this.server);

    this.logger.info('MCP Server initialized with all capabilities');
  }

  public async connectTransport(transport: ITransport): Promise<void> {
    await this.server.connect(transport as any); // Type assertion needed due to SDK limitations
    this.logger.info(`Transport connected: ${transport.sessionId}`);
  }

  public getServer(): McpServer {
    return this.server;
  }

  public async close(): Promise<void> {
    await this.server.close();
    this.logger.info('MCP Server closed');
  }
}
