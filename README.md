# ai-friendly-runner

⚡ Fast parallel npm script runner with AI-optimized output.

Go-based CLI tool for parallel command execution with colored output, XML tags for AI parsing, and minimal overhead (~10-50ms startup).

## Installation

```bash
npm install -g ai-friendly-runner
# or locally
npm install --save-dev ai-friendly-runner
```

## Quick Start

```bash
# Run multiple commands in parallel
aifr lint test build

# With custom options
aifr --threads 4 --output full lint test

# Auto-detect npm scripts vs direct commands
aifr test                    # → npm run test (if exists in package.json)
aifr "go fmt ./..."          # → go fmt ./... (direct command)
```

## Options

```bash
aifr [options] <command1> <command2> ...
```

| Option | Description | Example |
|--------|-------------|---------|
| `-o, --output <format>` | Output format: `none`, `errors` (default), `full` | `aifr -o full test` |
| `-n, --threads <num>` | Number of parallel threads (default: CPU cores - 1) | `aifr -n 4 lint test` |
| `-w, --stream` | Stream output in real-time | `aifr --stream build` |
| `-t, --no-time` | Hide execution time | `aifr --no-time test` |
| `-s, --no-summary` | Hide final summary | `aifr --no-summary lint` |
| `-h, --help` | Show help | `aifr --help` |

## Usage Examples

```bash
# CI/CD: run all checks in parallel
aifr lint test build

# Limit parallel threads
aifr --threads 2 test:unit test:e2e

# Stream output for long-running commands
aifr --stream "go test ./..." build

# Silent mode (exit code only)
aifr --output none lint test

# Full output with XML tags for AI
aifr --output full lint test build
```

## Output Format

**Default (errors):**

```
✅ lint (142ms)
✅ test (823ms)
Summary: 2/2 passed
```

**With errors:**

```
✅ lint (156ms)
❌ test (203ms)

<test>
Error: test failed
</test>
```

**AI-optimized (--output full):**

- All commands wrapped in XML tags `<command>...</command>`
- Easy for AI parsing and automated analysis

## Features

- ⚡ **Parallel execution** with thread control
- 🤖 **Auto-detection** of npm scripts vs direct commands
- 🎨 **AI-optimized output** with XML tags
- ⏱️ **Execution timer** for each command
- 🌊 **Streaming mode** for long operations
- 📦 **Cross-platform** (macOS, Linux, Windows)
- 🚀 **Fast startup** (~10-50ms vs ~100-200ms Node.js)
- ✅ **CI/CD friendly** (exit codes 0/1)

## Build from Source

```bash
# Requirements: Go 1.25+
go build -o aifr ./cmd/aifr

# Cross-platform build
./scripts/build.sh
```

---

**License:** MIT
**Repository:** [github.com/CyberWalrus/ai-friendly-runner](https://github.com/CyberWalrus/ai-friendly-runner)
