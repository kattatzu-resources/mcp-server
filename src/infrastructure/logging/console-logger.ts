import { ILogger } from "../../domain/interfaces/logger.interface.js";

export class ConsoleLogger implements ILogger {
    private readonly context: string;

    constructor(context: string) {
        this.context = context;
    }

    public info(message: string, ...args: any[]): void {
        console.log(`[INFO] [${this.context}] ${message}`, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] [${this.context}] ${message}`, ...args);
    }

    public error(message: string, error?: any, ...args: any[]): void {
        console.error(`[ERROR] [${this.context}] ${message}`, error || '', ...args);
    }

    public debug(message: string, ...args: any[]): void {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
        }
    }
}

export const createLogger = (context: string): ILogger => {
    return new ConsoleLogger(context);
};
