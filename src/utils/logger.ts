/**
 * Simple logger utility with different log levels
 */
export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    /**
     * Log an informational message
     */
    info(message: string, ...args: any[]): void {
        console.log(`[INFO] [${this.context}] ${message}`, ...args);
    }

    /**
     * Log a warning message
     */
    warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] [${this.context}] ${message}`, ...args);
    }

    /**
     * Log an error message
     */
    error(message: string, error?: any, ...args: any[]): void {
        console.error(`[ERROR] [${this.context}] ${message}`, error || '', ...args);
    }

    /**
     * Log a debug message
     */
    debug(message: string, ...args: any[]): void {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
        }
    }
}

/**
 * Create a logger instance for a specific context
 */
export const createLogger = (context: string): Logger => {
    return new Logger(context);
};
