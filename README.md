# MCP Server

A server that implements the Model Context Protocol (MCP) with support for multiple transports (SSE and STDIO) for real-time communications.

## Features

- Complete implementation of the Model Context Protocol (MCP)
- Real-time communication with SSE (Server-Sent Events)
- Clean architecture with SOLID principles
- Extensible tools, resources, and prompts
- Comprehensive logging and error handling
- Multiple transport support (SSE and STDIO)

## Architecture

The project follows Clean Architecture and SOLID principles:

- **Domain Layer**: Interfaces and domain models
- **Application Layer**: Use cases and services
- **Infrastructure Layer**: Concrete implementations (logging, tools, etc.)
- **Presentation Layer**: API and HTTP controllers

### Architecture Diagram

```
┌─────────────────────┐      ┌─────────────────────┐
│  Presentation       │      │  Application        │
│  Layer              │      │  Layer              │
│  - Express API      │─────▶│  - Use Cases        │
│  - Controllers      │      │  - Services         │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                                        ▼
┌─────────────────────┐      ┌─────────────────────┐
│  Infrastructure     │      │  Domain             │
│  Layer              │◀─────│  Layer              │
│  - Implementations  │      │  - Interfaces       │
│  - Adapters         │      │  - Models           │
└─────────────────────┘      └─────────────────────┘
```

## SOLID Principles Applied

- **S (Single Responsibility)**: Each class has a single responsibility
- **O (Open/Closed)**: Functionality is extensible without modifying existing code
- **L (Liskov Substitution)**: Derived types are completely substitutable for their base types
- **I (Interface Segregation)**: Interfaces are specific to each client
- **D (Dependency Inversion)**: Depends on abstractions, not concrete implementations

## Requirements

- Node.js 18 or higher
- Yarn or npm

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mcp-server.git
cd mcp-server

# Install dependencies
yarn install

# Build the project
yarn build
```

## Running

```bash
# Start the server
yarn start

# Or using custom scripts
yarn rebuild
```

By default, the server will run on port 3001. You can change the port by configuring the `PORT` environment variable.

## Transport Configuration

The MCP server supports two types of transports:

- **SSE (Server-Sent Events)**: For communication over HTTP
- **STDIO**: For communication through standard input/output

By default, both transports are enabled. You can configure which transports you want to use through environment variables:

```bash
# Enable only SSE
ENABLE_STDIO=false yarn start

# Enable only STDIO
ENABLE_SSE=false yarn start

# Enable both (default behavior)
ENABLE_SSE=true ENABLE_STDIO=true yarn start
```

## Endpoints

- **SSE**: `/sse` - Endpoint for establishing SSE connections
- **Messages**: `/messages` - Endpoint for sending JSON-RPC messages

## Extension

### Adding a New Tool

1. Create a tool class that implements the `ITool` interface
2. Add the tool to the list in `tools/index.ts`

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

Resources provide static or dynamic data that can be accessed by the client:

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

Prompts provide pre-defined conversation starters:

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

## License

MIT
