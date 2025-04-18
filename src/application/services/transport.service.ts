import { Response } from "express";
import { ILogger } from "../../domain/interfaces/logger.interface.js";
import { ITransport } from "../../domain/interfaces/transport.interface.js";

export class TransportService {
    private transports: Record<string, ITransport> = {};
    private readonly logger: ILogger;
    private readonly transportFactory: (res: Response) => Promise<ITransport>;
    private readonly onTransportConnected: (transport: ITransport) => Promise<void>;

    constructor(
        logger: ILogger,
        transportFactory: (res: Response) => Promise<ITransport>,
        onTransportConnected: (transport: ITransport) => Promise<void>
    ) {
        this.logger = logger;
        this.transportFactory = transportFactory;
        this.onTransportConnected = onTransportConnected;
    }

    public async createTransport(res: Response): Promise<ITransport> {
        const transport = await this.transportFactory(res);
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
