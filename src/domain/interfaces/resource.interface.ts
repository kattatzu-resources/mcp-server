import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface IResource {
    register(server: McpServer): void;
}
