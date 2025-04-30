# Binance.com MCP Server

![Node.js: ≥18](https://img.shields.io/badge/Node.js-≥18-green.svg)

MCP Server for Binance.com

## 💻 Requirements

- Node.js 18 or higher
- Yarn or npm package manager

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/kattatzu/binancne-mcp.git
cd binancne-mcp

# Install dependencies
yarn install

# Build the project
yarn build
```

## 🚀 Running the Server

```bash
# Start the server
yarn start

# Build and start in one command (for development)
yarn rebuild
```

By default, the server runs on port 3001. You can configure this using the `PORT` environment variable.

## 🔌 Transport Options

The MCP server supports two transport methods:

| Transport | Description                   | Use Case                          |
|-----------|-------------------------------|-----------------------------------|
| **SSE**   | Server-Sent Events over HTTP  | Web applications, browser clients |
| **STDIO** | Standard input/output streams | CLI tools, local applications     |

## 🛣️ API Endpoints

- **SSE**: `/sse` - Establish SSE connections for real-time communication
- **Messages**: `/messages` - Send JSON-RPC messages to the server

## 🧪 Testing

Use the official MCP Inspector tool to test your server implementation:

1. Build and start your MCP Server

```bash
yarn build
yarn rebuild  # if using SSE transport (builds & starts)
# OR
yarn start    # manual start
```

2. Run the inspector against your server

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

3. Access to Inspecto UI
   http://127.0.0.1:6274 🚀

## 🧩 Extending Functionality

### Adding a New Tool

```typescript
// tools/custom/my-tool.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITool } from "../core/domain/interfaces/tool.interface.js";
import { ILogger } from "../core/domain/interfaces/logger.interface.js";

export class MyTool implements ITool {
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public register(server: McpServer): void {
        server.tool(
            "my-tool",
            "Description of my tool",
            {
                param1: z.string().describe("Parameter description"),
            },
            async ({ param1 }) => {
                this.logger.info(`MyTool called with param1: ${param1}`);
                
                return {
                    content: [
                        {
                            type: "text",
                            text: `Result: ${param1}`,
                        },
                    ],
                };
            },
        );

        this.logger.info("MyTool registered");
    }
}
```

### Adding a New Resource

```typescript
// resources/custom/my-resource.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IResource } from "../core/domain/interfaces/resource.interface.js";
import { ILogger } from "../core/domain/interfaces/logger.interface.js";

export class MyResource implements IResource {
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public register(server: McpServer): void {
        server.resource('my-resource', 'my-data.json', async () => {
            this.logger.info('My resource accessed');

            return {
                contents: [
                    {
                        uri: 'my-data.json',
                        text: JSON.stringify({ key: "value" }, null, 2),
                        mimeType: 'application/json',
                    },
                ],
            };
        });

        this.logger.info('My resource registered');
    }
}
```

### Adding a New Prompt

```typescript
// prompts/custom/my-prompt.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IPrompt } from "../core/domain/interfaces/prompt.interface.js";
import { ILogger } from "../core/domain/interfaces/logger.interface.js";

export class MyPrompt implements IPrompt {
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public register(server: McpServer): void {
        server.prompt(
            'my-prompt',
            'Description of my prompt',
            () => {
                this.logger.info('My prompt accessed');

                return {
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Initial user message',
                            },
                        },
                        {
                            role: 'assistant',
                            content: {
                                type: 'text',
                                text: 'Initial assistant response',
                            },
                        },
                    ],
                };
            },
        );

        this.logger.info('My prompt registered');
    }
}
```
