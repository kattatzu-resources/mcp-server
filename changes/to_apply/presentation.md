// src/presentation/api/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ILogger } from "../../../domain/interfaces/logger.interface.js";

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorMiddleware {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  public notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new HttpError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
  };

  public errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    this.logger.error(`Error: ${message}`, err);

    res.status(statusCode).json({
      error: {
        message,
        status: statusCode,
        timestamp: new Date().toISOString(),
      },
    });
  };
}

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
      const transport = await this.transportService.createTransport(res);
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

// src/presentation/api/routes/sse.routes.ts
import { Router } from "express";
import { SseController } from "../../controllers/sse.controller.js";
import { ILogger } from "../../../domain/interfaces/logger.interface.js";
import { TransportService } from "../../../application/services/transport.service.js";

export const createSseRoutes = (transportService: TransportService, logger: ILogger): Router => {
  const router = Router();
  const sseController = new SseController(transportService, logger);

  // SSE endpoint for establishing the stream
  router.get("/", sseController.establishStream.bind(sseController));

  // Messages endpoint for receiving client JSON-RPC requests
  router.post("/", sseController.handleMessage.bind(sseController));

  return router;
};

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
    // Create SSE routes
    const sseRoutes = createSseRoutes(this.transportService, this.logger);

    // Routes
    this.app.use(this.config.endpoints.sse, sseRoutes);

    // Also mount the messages endpoint at the root level for backward compatibility
    this.app.use(this.config.endpoints.messages, sseRoutes);
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

// src/presentation/api/server.ts
import { Express } from "express";
import { ServerConfig } from "../../domain/models/server-config.model.js";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { TransportService } from "../../application/services/transport.service.js";
import { ServerUseCase } from "../../application/usecases/server.usecase.js";

export class HttpServer {
  private readonly app: Express;
  private readonly config: ServerConfig;
  private readonly logger: ILogger;
  private readonly transportService: TransportService;
  private readonly serverUseCase: ServerUseCase;

  constructor(
    app: Express,
    config: ServerConfig,
    logger: ILogger,
    transportService: TransportService,
    serverUseCase: ServerUseCase
  ) {
    this.app = app;
    this.config = config;
    this.logger = logger;
    this.transportService = transportService;
    this.serverUseCase = serverUseCase;
    this.setupShutdownHandlers();
  }

  public start(): void {
    const PORT = this.config.server.port;

    this.app.listen(PORT, () => {
      this.logger.info(`MCP Server running on SSE at http://localhost:${PORT}${this.config.endpoints.sse}`);
    });
  }

  private setupShutdownHandlers(): void {
    // Handle server shutdown
    process.on("SIGINT", this.gracefulShutdown.bind(this));
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    this.logger.info("Shutting down server...");

    try {
      // Close all active transports
      await this.transportService.closeAllTransports();

      // Close MCP server
      await this.serverUseCase.close();

      this.logger.info("Server shutdown complete");
      process.exit(0);
    } catch (error) {
      this.logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  }
}