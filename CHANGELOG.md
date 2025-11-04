# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-XX

### Added

- Go implementation for 10x faster startup (~10-50ms vs ~100-200ms)
- Cobra-based CLI with improved help and flag parsing
- Buffer pooling for memory efficiency
- Smart script autodetection (checks package.json)
- Context.Context support for graceful cancellation (Ctrl+C)
- CGO_ENABLED=0 for static binaries (Alpine Linux compatible)

### Changed

- Migrated from TypeScript to Go
- All binaries now statically linked

### Security

- **[FIXED]** Shell injection vulnerability (now using go-shellwords)

### Fixed

- go.mod version corrected to 1.21
- Tests relocated to correct Go convention location
- Test coverage now >70%

## [0.1.0] - 2024-XX-XX

### Added

- Initial TypeScript implementation
- Parallel command execution with p-limit
- XML-tagged output for AI consumption
- Stream mode for long-running commands
- Output format control (none/errors/full)
