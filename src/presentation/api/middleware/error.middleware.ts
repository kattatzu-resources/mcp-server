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
