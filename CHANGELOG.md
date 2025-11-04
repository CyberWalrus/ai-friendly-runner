# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-11-04

<small>04.11.2025 05:04</small>

### Changed

- Улучшена читаемость вывода: автоматическое удаление префиксов запускаторов (yarn, npm, pnpm, bun и др.) из имени команды в статусных строках

## [0.3.1] - 2025-11-04

<small>04.11.2025 04:48</small>

### Added

- Автоматическое создание симлинков для бинарных файлов в `node_modules/.bin` при установке пакета через npm/yarn <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/a258c2a55b1b76a8b7ade885ad1e68827e2c151b" target="_blank">a258c2a</a>

## [0.3.0] - 2025-11-04

<small>04.11.2025 04:31</small>

### Added

- GitHub Actions workflows для CI/CD (build-and-test.yml, release.yml) <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/00e5c6189197b88b5d0185b1aa0cfb2c2a7dcc02" target="_blank">00e5c61</a>
- CHANGELOG.md для документирования изменений <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/89ad7db4d6fdef69350ad16c522165a54169b41b" target="_blank">89ad7db</a>

### Changed

- Обновлена конфигурация GitHub Actions для извлечения версии из package.json и запуска юнит-тестов из директории internal <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/927630d1b0df2ea40e065f57296d0fce7d0690be" target="_blank">927630d</a> <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/88f684f0ccbacff783596c7d1fa44b52f0aefd1c" target="_blank">88f684f</a>
- CHANGELOG переведен на английский язык <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/a2fd66256a3fd079771d81be02c07758aa7bbb89" target="_blank">a2fd662</a>
- Обновлена документация для Go реализации <a href="https://github.com/CyberWalrus/ai-friendly-runner/commit/40c15d37f6a0b8c2e529447384053a39dfd74acb" target="_blank">40c15d3</a>

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
