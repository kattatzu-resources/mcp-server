{
  "name": "mcp-sse-server",
  "version": "1.0.0",
  "main": "build/index.js",
  "license": "MIT",
  "type": "module",
  "bin": {
    "mcp-sse-server": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod 755 build/index.js",
    "start": "node build/index.js",
    "dev": "tsc -w",
    "lint": "eslint src/**/*.ts",
    "test": "jest",
    "rebuild": "yarn build && yarn start"
  },
  "files": [
    "build"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.9.0",
    "express": "^5.1.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.1",
    "@types/jest": "^29.5.12",
    "@types/node": "^22.14.1",
    "@typescript-eslint/eslint-plugin": "^7.3.1",
    "@typescript-eslint/parser": "^7.3.1",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "typescript": "^5.8.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}