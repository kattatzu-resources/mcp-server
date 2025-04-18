# MCP SSE Server

Un servidor que implementa el Protocolo de Contexto de Modelo (MCP) utilizando Server-Sent Events (SSE) para comunicaciones en tiempo real.

## Características

- Implementación completa del Protocolo de Contexto de Modelo (MCP)
- Comunicación en tiempo real con SSE
- Arquitectura limpia con principios SOLID
- Herramientas, recursos y prompts extensibles
- Logging completo y manejo de errores

## Arquitectura

El proyecto sigue los principios de Arquitectura Limpia y SOLID:

- **Capa de Dominio**: Interfaces y modelos de dominio
- **Capa de Aplicación**: Casos de uso y servicios
- **Capa de Infraestructura**: Implementaciones concretas (logging, herramientas, etc.)
- **Capa de Presentación**: API y controladores HTTP

### Diagrama de Arquitectura

```
┌─────────────────────┐      ┌─────────────────────┐
│  Capa de            │      │  Capa de            │
│  Presentación       │      │  Aplicación         │
│  - API Express      │─────▶│  - Casos de Uso     │
│  - Controladores    │      │  - Servicios        │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                                        ▼
┌─────────────────────┐      ┌─────────────────────┐
│  Capa de            │      │  Capa de            │
│  Infraestructura    │◀─────│  Dominio            │
│  - Implementaciones │      │  - Interfaces       │
│  - Adaptadores      │      │  - Modelos          │
└─────────────────────┘      └─────────────────────┘
```

## Principios SOLID Aplicados

- **S (Responsabilidad Única)**: Cada clase tiene una única responsabilidad
- **O (Abierto/Cerrado)**: Las funcionalidades son extensibles sin modificar el código existente
- **L (Sustitución de Liskov)**: Los tipos derivados son completamente sustituibles por sus tipos base
- **I (Segregación de Interfaces)**: Las interfaces son específicas para cada cliente
- **D (Inversión de Dependencias)**: Depende de abstracciones, no de implementaciones concretas

## Requisitos

- Node.js 18 o superior
- Yarn o npm

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mcp-sse-server.git
cd mcp-sse-server

# Instalar dependencias
yarn install

# Compilar el proyecto
yarn build
```

## Ejecución

```bash
# Iniciar el servidor
yarn start

# O utilizando scripts personalizados
yarn rebuild
```

Por defecto, el servidor se ejecutará en el puerto 3001. Puedes cambiar el puerto configurando la variable de entorno `PORT`.

## Endpoints

- **SSE**: `/sse` - Endpoint para establecer conexiones SSE
- **Messages**: `/messages` - Endpoint para enviar mensajes JSON-RPC

## Extensión

### Agregar una Nueva Herramienta

1. Crear una clase de herramienta que implemente la interfaz `ITool`
2. Agregar la herramienta a la lista en `infrastructure/tools/index.ts`

```typescript
// infrastructure/tools/custom/my-tool.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ITool } from "../../../domain/interfaces/tool.interface.js";
import { ILogger } from "../../../domain/interfaces/logger.interface.js";

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

## Licencia

MIT