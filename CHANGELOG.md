# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-04

### Added

- Go implementation CLI tool with architecture: cmd/aifr, internal/*, pkg/cli
- Parallel command execution via goroutines with thread control
- Automatic npm script detection through package.json parsing
- Real-time streaming command output with prefixes
- Output formatting with XML tags for AI parsing
- Context.Context support for graceful cancellation (Ctrl+C)
- Static binary builds (CGO_ENABLED=0) for Alpine Linux compatibility
- GitHub Actions workflows for CI/CD (build-and-test.yml, release.yml)
- Build scripts for cross-platform compilation (darwin, linux, windows)
- Unit and E2E tests for all Go modules

### Changed

- Migrated from TypeScript/Node.js to Go (10x faster startup: ~10-50ms vs ~100-200ms)
- All binaries are now statically linked
- Updated project structure: removed src/, types/, added cmd/, internal/, pkg/
- Updated configuration: go.mod, go.sum, package.json, .gitignore
- Updated documentation: README.md, architecture.xml, package-ai-docs.md

### Removed

- TypeScript implementation (src/*, types/*)
- Node.js dependencies and configuration (tsconfig.json, tsup.config.ts, vitest.config.ts)
- ESLint and Knip configuration
- Old GitHub Actions workflow (publish.yml)

## [0.1.2] - 2025-11-04

### Fixed

- Updated execCommand function to use platform-dependent shell
- Improved error handling when executing commands
- Updated tests to account for new call parameters

### Changed

- Updated threshold values in tests

## [0.1.1] - 2025-11-04

### Added

- AI-optimized output format with XML tags
- Improved test helper functions

### Changed

- Updated documentation for ai-friendly-runner

## [0.1.0] - 2025-11-03

### Added

- Initial TypeScript implementation
- Parallel command execution with p-limit
- XML tags in output for AI consumption
- Streaming mode for long-running commands
- Output format control (none/errors/full)
- CI/CD configuration
- Basic project documentation
