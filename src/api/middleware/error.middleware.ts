import { Request, Response, NextFunction } from "express";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("ErrorMiddleware");

/**
 * Custom error class with status code
 */
export class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not found error middleware
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const error = new HttpError(`Not Found - ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Error handling middleware
 */
export const errorMiddleware = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(`Error: ${message}`, err);

    res.status(statusCode).json({
        error: {
            message,
            status: statusCode,
            timestamp: new Date().toISOString(),
        },
    });
};
