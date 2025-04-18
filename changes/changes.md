# Implementación de STDIO Transport y Configuración de Adaptadores

Este documento describe los cambios necesarios para implementar el adapter de STDIO transport y permitir la selección de qué adaptadores se desean habilitar en el servidor MCP.

## 1. Estructura de Cambios

### 1.1 Nuevos Archivos

- `src/infrastructure/transport/stdio-transport.adapter.ts`: Implementación del adaptador STDIO
- `src/infrastructure/transport/transport-factory.ts`: Factory abstracta para crear transportes
- `src/domain/models/transport-config.model.ts`: Modelo para la configuración de transportes

### 1.2 Archivos a Modificar

- `src/infrastructure/config/config.ts`: Agregar opciones de configuración para transportes
- `src/infrastructure/transport/sse-transport.adapter.ts`: Refactorizar para usar la factory abstracta
- `src/index.ts`: Modificar para crear y utilizar los transportes configurados
- `src/presentation/api/app.ts`: Modificar para montar rutas solo si SSE está habilitado
- `src/application/factories/server.factory.ts`: Actualizar para soportar múltiples transportes

## 2. Implementaciones

### 2.1 Modelo de Configuración de Transportes

```typescript
// src/domain/models/transport-config.model.ts
export interface TransportConfig {
    enabled: boolean;
    options?: Record<string, any>;
}

export interface TransportsConfig {
    sse: TransportConfig;
    stdio: TransportConfig;
}
```

### 2.2 Actualización de la Configuración

```typescript
// src/infrastructure/config/config.ts
import { ServerConfig } from "../../domain/models/server-config.model.js";
import { TransportsConfig } from "../../domain/models/transport-config.model.js";

export const config: ServerConfig = {
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
        name: "mcp-server",
        version: "1.0.0",
    },
    endpoints: {
        sse: "/sse",
        messages: "/messages",
    },
    transports: {
        sse: {
            enabled: process.env.ENABLE_SSE ? process.env.ENABLE_SSE === "true" : true,
        },
        stdio: {
            enabled: process.env.ENABLE_STDIO ? process.env.ENABLE_STDIO === "true" : true,
        }
    }
};
```

### 2.3 Actualización del Modelo ServerConfig

```typescript
// src/domain/models/server-config.model.ts
import { TransportsConfig } from "./transport-config.model.js";

export interface ServerConfig {
    server: {
        port: number;
        name: string;
        version: string;
    };
    endpoints: {
        sse: string;
        messages: string;
    };
    transports: TransportsConfig;
}
```

### 2.4 Factory Abstracta para Transportes

```typescript
// src/infrastructure/transport/transport-factory.ts
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ITransport } from "../../domain/interfaces/transport.interface.js";

export interface ITransportFactory {
    createTransport(...args: any[]): Promise<ITransport>;
}

export abstract class TransportFactory implements ITransportFactory {
    protected readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    abstract createTransport(...args: any[]): Promise<ITransport>;
}
```

### 2.5 Implementación del Adaptador SSE (Refactorizado)

```typescript
// src/infrastructure/transport/sse-transport.adapter.ts
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Response } from "express";
import { ITransport } from "../../domain/interfaces/transport.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { config } from "../config/config.js";
import { TransportFactory } from "./transport-factory.js";

export class SseTransportFactory extends TransportFactory {
    constructor(logger: ILogger) {
        super(logger);
    }

    public async createTransport(res: Response): Promise<ITransport> {
        this.logger.debug("Creating new SSE transport");
        // Use the root messages endpoint for compatibility
        const transport = new SSEServerTransport(
            config.endpoints.messages,
            res
        ) as unknown as ITransport;

        this.logger.debug(`SSE transport created with session ID: ${transport.sessionId}`);
        return transport;
    }
}
```

### 2.6 Implementación del Adaptador STDIO

```typescript
// src/infrastructure/transport/stdio-transport.adapter.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ITransport } from "../../domain/interfaces/transport.interface.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { TransportFactory } from "./transport-factory.js";

export class StdioTransportFactory extends TransportFactory {
    constructor(logger: ILogger) {
        super(logger);
    }

    public async createTransport(): Promise<ITransport> {
        this.logger.debug("Creating new STDIO transport");
        
        // Create the STDIO transport
        const transport = new StdioServerTransport() as unknown as ITransport;
        
        this.logger.debug(`STDIO transport created with session ID: ${transport.sessionId}`);
        return transport;
    }
}
```

### 2.7 Modificación del Archivo app.ts

```typescript
// src/presentation/api/app.ts
import express, { Express } from "express";
import { ServerConfig } from "../../domain/models/server-config.model.js";
import { TransportService } from "../../application/services/transport.service.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ErrorMiddleware } from "./middleware/error.middleware.js";
import { createSseRoutes } from "./routes/sse.routes.js";

export class ExpressApp {
    private readonly app: Express;
    private readonly config: ServerConfig;
    private readonly transportService: TransportService;
    private readonly logger: ILogger;

    constructor(
        config: ServerConfig,
        transportService: TransportService,
        logger: ILogger
    ) {
        this.config = config;
        this.transportService = transportService;
        this.logger = logger;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        // Only set up SSE routes if SSE transport is enabled
        if (this.config.transports.sse.enabled) {
            this.logger.info("Setting up SSE routes");
            
            // Create SSE routes
            const sseRoutes = createSseRoutes(this.transportService, this.logger);

            // Routes
            this.app.use(this.config.endpoints.sse, sseRoutes);

            // Also mount the messages endpoint at the root level for backward compatibility
            this.app.use(this.config.endpoints.messages, sseRoutes);
        } else {
            this.logger.info("SSE transport is disabled, skipping SSE routes setup");
        }
    }

    private setupErrorHandling(): void {
        const errorMiddleware = new ErrorMiddleware(this.logger);

        // Error handling
        this.app.use(errorMiddleware.notFound);
        this.app.use(errorMiddleware.errorHandler);
    }

    public getApp(): Express {
        return this.app;
    }
}
```

### 2.8 Modificación de server.factory.ts

```typescript
// src/application/factories/server.factory.ts
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
import { ITransportFactory } from "../../infrastructure/transport/transport-factory.js";

export class ServerFactory {
    private readonly config: ServerConfig;
    private readonly logger: ILogger;
    private readonly tools: ITool[];
    private readonly resources: IResource[];
    private readonly prompts: IPrompt[];
    private readonly transportFactories: {
        sse?: ITransportFactory;
        stdio?: ITransportFactory;
    };

    constructor(
        config: ServerConfig,
        logger: ILogger,
        tools: ITool[],
        resources: IResource[],
        prompts: IPrompt[],
        transportFactories: {
            sse?: ITransportFactory;
            stdio?: ITransportFactory;
        }
    ) {
        this.config = config;
        this.logger = logger;
        this.tools = tools;
        this.resources = resources;
        this.prompts = prompts;
        this.transportFactories = transportFactories;
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

        // Create transport service with multiple factories
        const transportService = new TransportService(
            this.logger,
            this.transportFactories,
            (transport) => serverUseCase.connectTransport(transport)
        );

        return {
            serverUseCase,
            transportService,
        };
    }
}
```

### 2.9 Modificación de transport.service.ts

```typescript
// src/application/services/transport.service.ts
import { Response } from "express";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ITransport } from "../../domain/interfaces/transport.interface.js";
import { ITransportFactory } from "../../infrastructure/transport/transport-factory.js";

export class TransportService {
    private transports: Record<string, ITransport> = {};
    private readonly logger: ILogger;
    private readonly transportFactories: {
        sse?: ITransportFactory;
        stdio?: ITransportFactory;
    };
    private readonly onTransportConnected: (transport: ITransport) => Promise<void>;

    constructor(
        logger: ILogger,
        transportFactories: {
            sse?: ITransportFactory;
            stdio?: ITransportFactory;
        },
        onTransportConnected: (transport: ITransport) => Promise<void>
    ) {
        this.logger = logger;
        this.transportFactories = transportFactories;
        this.onTransportConnected = onTransportConnected;
    }

    public async createSseTransport(res: Response): Promise<ITransport> {
        if (!this.transportFactories.sse) {
            throw new Error("SSE transport factory not available");
        }

        const transport = await this.transportFactories.sse.createTransport(res);
        return this.setupTransport(transport);
    }

    public async createStdioTransport(): Promise<ITransport> {
        if (!this.transportFactories.stdio) {
            throw new Error("STDIO transport factory not available");
        }

        const transport = await this.transportFactories.stdio.createTransport();
        return this.setupTransport(transport);
    }

    private async setupTransport(transport: ITransport): Promise<ITransport> {
        const sessionId = transport.sessionId;

        this.transports[sessionId] = transport;

        transport.onclose = () => {
            this.logger.info(`Transport closed for session ${sessionId}`);
            this.removeTransport(sessionId);
        };

        await this.onTransportConnected(transport);
        await transport.start();

        this.logger.info(`Created new transport with session ID: ${sessionId}`);
        return transport;
    }

    public getTransport(sessionId: string): ITransport | undefined {
        return this.transports[sessionId];
    }

    public removeTransport(sessionId: string): void {
        delete this.transports[sessionId];
        this.logger.info(`Removed transport with session ID: ${sessionId}`);
    }

    public async closeAllTransports(): Promise<void> {
        const sessionIds = Object.keys(this.transports);

        for (const sessionId of sessionIds) {
            try {
                this.logger.info(`Closing transport for session ${sessionId}`);
                await this.transports[sessionId].close();
                this.removeTransport(sessionId);
            } catch (error) {
                this.logger.error(`Error closing transport for session ${sessionId}:`, error);
            }
        }

        this.logger.info("All transports closed");
    }
}
```

### 2.10 Modificación del Controlador SSE

```typescript
// src/presentation/controllers/sse.controller.ts
import { Request, Response } from "express";
import { TransportService } from "../../application/services/transport.service.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { HttpError } from "../api/middleware/error.middleware.js";

export class SseController {
    private readonly transportService: TransportService;
    private readonly logger: ILogger;

    constructor(transportService: TransportService, logger: ILogger) {
        this.transportService = transportService;
        this.logger = logger;
    }

    public async establishStream(req: Request, res: Response): Promise<void> {
        this.logger.info("Received GET request to establish SSE stream");

        try {
            // Set headers for SSE
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // Create a new transport
            const transport = await this.transportService.createSseTransport(res);
            this.logger.info(`Established SSE stream with session ID: ${transport.sessionId}`);
        } catch (error) {
            this.logger.error("Error establishing SSE stream:", error);
            if (!res.headersSent) {
                res.status(500).send("Error establishing SSE stream");
            }
        }
    }

    public async handleMessage(req: Request, res: Response): Promise<void> {
        this.logger.info("Received POST request to handle message");

        // Handle ping message directly
        if (req.body && req.body.method === "ping") {
            this.logger.info("Received ping message, responding with pong");
            const timestamp = new Date().toISOString();
            res.json({
                jsonrpc: "2.0",
                result: {
                    status: "success",
                    message: `Pong! Server is alive at ${timestamp}`
                },
                id: req.body.id || null
            });
            return;
        }

        // Extract session ID from URL query parameter
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
            this.logger.error("No session ID provided in request URL");
            throw new HttpError("Missing sessionId parameter", 400);
        }

        const transport = this.transportService.getTransport(sessionId);
        if (!transport) {
            this.logger.error(`No active transport found for session ID: ${sessionId}`);
            throw new HttpError("Session not found", 404);
        }

        try {
            // Handle the POST message with the transport
            await transport.handlePostMessage(req, res, req.body);
        } catch (error) {
            this.logger.error("Error handling request:", error);
            if (!res.headersSent) {
                throw new HttpError("Error handling request", 500);
            }
        }
    }
}
```

### 2.11 Modificación del Archivo principal (index.ts)

```typescript
#!/usr/bin/env node
import { createLogger } from "./infrastructure/logging/console-logger.js";
import { config } from "./infrastructure/config/config.js";
import { createTools } from "./infrastructure/tools/index.js";
import { createResources } from "./infrastructure/resources/index.js";
import { createPrompts } from "./infrastructure/prompts/index.js";
import { ServerFactory } from "./application/factories/server.factory.js";
import { SseTransportFactory } from "./infrastructure/transport/sse-transport.adapter.js";
import { StdioTransportFactory } from "./infrastructure/transport/stdio-transport.adapter.js";
import { ExpressApp } from "./presentation/api/app.js";
import { HttpServer } from "./presentation/api/server.js";

/**
 * Main application entry point
 */
async function main() {
    const mainLogger = createLogger("Main");

    try {
        mainLogger.info("Starting MCP Server...");

        // Create logger instances for each component
        const toolsLogger = createLogger("Tools");
        const resourcesLogger = createLogger("Resources");
        const promptsLogger = createLogger("Prompts");
        const transportLogger = createLogger("Transport");
        const serverLogger = createLogger("Server");

        // Create core components
        const tools = createTools(toolsLogger);
        const resources = createResources(resourcesLogger);
        const prompts = createPrompts(promptsLogger);

        // Create transport factories based on configuration
        const transportFactories: {
            sse?: SseTransportFactory;
            stdio?: StdioTransportFactory;
        } = {};

        if (config.transports.sse.enabled) {
            mainLogger.info("SSE transport enabled");
            transportFactories.sse = new SseTransportFactory(transportLogger);
        }

        if (config.transports.stdio.enabled) {
            mainLogger.info("STDIO transport enabled");
            transportFactories.stdio = new StdioTransportFactory(transportLogger);
        }

        // Create server factory
        const serverFactory = new ServerFactory(
            config,
            serverLogger,
            tools,
            resources,
            prompts,
            transportFactories
        );

        // Create server and transport service
        const { serverUseCase, transportService } = serverFactory.createServer();

        // Initialize MCP server with all capabilities
        serverUseCase.initialize();

        // Create STDIO transport if enabled
        if (config.transports.stdio.enabled) {
            try {
                await transportService.createStdioTransport();
                mainLogger.info("STDIO transport created successfully");
            } catch (error) {
                mainLogger.error("Error creating STDIO transport:", error);
            }
        }

        // Only start HTTP server if SSE is enabled
        if (config.transports.sse.enabled) {
            // Create and start Express app
            const apiLogger = createLogger("API");
            const expressApp = new ExpressApp(config, transportService, apiLogger);
            const httpServer = new HttpServer(
                expressApp.getApp(),
                config,
                apiLogger,
                transportService,
                serverUseCase
            );

            // Start HTTP server
            httpServer.start();
        } else {
            mainLogger.info("SSE transport disabled, HTTP server not started");
        }

        mainLogger.info("MCP Server started successfully");
    } catch (error) {
        mainLogger.error("Fatal error in main():", error);
        process.exit(1);
    }
}

// Start the application
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
```

## 3. Pruebas

### 3.1 Ejecutar con ambos transportes habilitados (por defecto)

```bash
yarn start
```

### 3.2 Ejecutar solo con SSE habilitado

```bash
ENABLE_STDIO=false yarn start
```

### 3.3 Ejecutar solo con STDIO habilitado

```bash
ENABLE_SSE=false yarn start
```

## 4. Actualización del README.md

Agregar la siguiente sección al README.md:

```markdown
## Configuración de Transportes

El servidor MCP soporta dos tipos de transportes:

- **SSE (Server-Sent Events)**: Para comunicación a través de HTTP
- **STDIO**: Para comunicación a través de entrada/salida estándar

Por defecto, ambos transportes están habilitados. Puede configurar qué transportes desea utilizar a través de variables de entorno:

```bash
# Habilitar solo SSE
ENABLE_STDIO=false yarn start

# Habilitar solo STDIO
ENABLE_SSE=false yarn start

# Habilitar ambos (comportamiento por defecto)
ENABLE_SSE=true ENABLE_STDIO=true yarn start
```

## 5. Actualizaciones en Archivos de Test

Actualizar los archivos de test para reflejar los cambios en la arquitectura de transporte si es necesario.

## 6. Notas adicionales

- La implementación de STDIO permite que el servidor funcione en modo CLI sin necesidad de HTTP.
- La configuración por defecto hace que el servidor acepte conexiones tanto por HTTP (SSE) como por STDIO.
- La arquitectura es extensible para futuros transportes como WebSocket o gRPC.
- Se mantiene la compatibilidad con la versión anterior que solo usaba SSE.