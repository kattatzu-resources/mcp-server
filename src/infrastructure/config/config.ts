import { ServerConfig } from "../../domain/models/server-config.model.js";

export const config: ServerConfig = {
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
        name: "sse-mcp-server",
        version: "1.0.0",
    },
    endpoints: {
        sse: "/sse",
        messages: "/messages",
    }
};
