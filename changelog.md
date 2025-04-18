# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- *No unreleased additions yet*

### Changed
- *No unreleased changes yet*

### Fixed
- *No unreleased fixes yet*

## [0.1.0] - 2025-04-18

### Added
- Implement STDIO transport and fix transport issues (288b538)
  - Added new `stdio-transport.adapter.ts` for STDIO communication
  - Created `transport-factory.ts` as an abstract factory for transport creation
  - Added `transport-config.model.ts` for transport configuration
  - Implemented environment variable configuration for enabling/disabling transports

### Changed
- Updated server initialization to support multiple transport types
- Modified Express app to conditionally mount routes based on enabled transports
- Refactored transport service to handle multiple transport types

## [0.1.0-beta] - 2025-04-17

### Added
- Implement MCP SSE server template (fe9521b)
  - Added Server-Sent Events (SSE) transport implementation
  - Created Express.js server with SSE endpoints
  - Implemented MCP server configuration
- First version of MCP SSE Server template (6fc00f3)
  - Initial project setup with basic structure
  - Added sample tools (math/sum, system/ping)
  - Added sample resources (greeting, weather)

### Changed
- Refactor: Implement Clean Architecture and SOLID principles (e1ea767)
  - Organized codebase into domain, application, infrastructure, and presentation layers
  - Created interfaces for all core components (logger, prompt, resource, tool, transport)
  - Implemented dependency injection pattern throughout the application
  - Separated business logic from framework-specific code
- Remove old code files as part of project restructuring (90f45e8)

## How to update this file

When making changes to the codebase, please update this changelog following these guidelines:

1. Add a brief description of your changes under the appropriate section:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** in case of vulnerabilities

2. Include the commit hash in parentheses after each entry

3. For significant releases, create a new version section with the date

This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
