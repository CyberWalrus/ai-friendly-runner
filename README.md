# ai-friendly-runner

Parallel npm script runner with AI-optimized output format.

## Description

`ai-friendly-runner` is a CLI tool that runs multiple npm scripts in parallel with structured, color-coded output optimized for both AI and human readability. It measures execution time, provides clear success/failure status for each command, and supports flexible output formatting with XML tags for AI consumption.

## Installation

### Global Installation

```bash
npm install -g ai-friendly-runner
# or
yarn global add ai-friendly-runner
```

### Local Installation (Recommended for Projects)

```bash
npm install --save-dev ai-friendly-runner
# or
yarn add -D ai-friendly-runner
```

## Quick Start

After installation, you can use the `air` or `ai-runner` command:

```bash
air lint test typecheck
```

## Usage

### Basic Usage

```bash
# Run multiple npm scripts in parallel
air lint test build

# Using full command name
ai-runner lint:ts lint:eslint test:unit
```

### Command-Line Arguments

The tool accepts npm script names (without `npm run` prefix) or direct commands:

```bash
# Simple npm scripts (no quotes needed)
air lint test build

# Commands with spaces or flags (use quotes)
air "lint:ts" "yarn tsc --noEmit"
air "npm run build" "npm test"
air "node -e 'console.log(123)'" "test:unit"
```

## CLI Options

### `-h, --help`

Show help message with usage information.

```bash
air --help
```

### `-t, --no-time`

Hide execution time from output.

```bash
air --no-time lint test
```

### `-s, --no-summary`

Hide final summary (pass/fail count).

```bash
air --no-summary lint test
```

### `-o, --output <format>`

Set output format. Available values:

- `none` - No output (only exit code)
- `errors` - Show only failed commands (default)
- `full` - Show all commands with full output

```bash
air --output full lint test
air -o none lint test  # Silent mode
```

### `-w, --stream`

Enable streaming output with command prefixes. Useful for long-running commands where you want to see output in real-time.

```bash
air --stream build test
```

### `-n, --threads <number>`

Set the number of parallel threads. Default is `CPU cores - 1` (minimum 1).

```bash
air --threads 4 lint test build
air -n 2 lint test
```

## Output Format

### Success Case

```
Running: lint, test

✅ lint (142ms)
✅ test (823ms)

Summary: 2/2 passed
Total time: 823ms
```

### Failure Case

```
Running: lint, test, typecheck

✅ lint (156ms)
✅ test (891ms)
❌ typecheck (203ms)

Summary: 2/3 passed
Total time: 891ms

❌ typecheck:
src/utils/helper.ts:15:3 - error TS2322
Type 'number' is not assignable to type 'string'.
```

### AI-Optimized Format (with `--output full`)

When using `--output full`, the output includes XML tags for better AI parsing:

```
<lint>
✅ lint (142ms)
[stdout output]
</lint>

<test>
✅ test (823ms)
[stdout output]
</test>
```

Failed commands are automatically wrapped in XML tags regardless of output format:

```
❌ typecheck (203ms)

<typecheck>
❌ typecheck:
[error output]
</typecheck>
```

## Programmatic Usage

You can also use the tool programmatically:

```typescript
import { run } from 'ai-friendly-runner';

// Run commands programmatically
await run({
  commands: ['lint', 'test', 'typecheck'],
  flags: {
    output: 'errors',
    showSummary: true,
    showTime: true,
    stream: false,
    threads: 4,
  },
});
```

## Features

- **Parallel Execution**: Runs all commands simultaneously using configurable thread pool
- **AI-Optimized Output**: Structured format with XML tags and clear status indicators (✅/❌)
- **Execution Time**: Displays duration for each command in milliseconds
- **Error Details**: Shows stderr and stdout only for failed commands (configurable)
- **Streaming Mode**: Real-time output with command prefixes
- **Exit Codes**: Returns 0 on success, 1 on failure (CI/CD friendly)
- **TypeScript**: Fully typed with strict mode enabled
- **Flexible Output**: Multiple output formats (none, errors, full)
- **Thread Control**: Configurable parallel execution limits

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## Examples

### CI/CD Pipeline

```bash
# Run all quality checks in parallel
air lint typecheck test:unit test:e2e

# With custom thread count
air --threads 8 lint typecheck test:unit test:e2e

# Silent mode (exit code only)
air --output none lint test
```

### Development Workflow

```bash
# Quick check before commit
air lint:ts lint:eslint test:unit

# With streaming output for long builds
air --stream build test

# Full output for debugging
air --output full lint test
```

### Custom Commands

```bash
# Run direct commands (not npm scripts)
air "yarn tsc --noEmit" "eslint ." "vitest run"

# Mix npm scripts and direct commands
air lint "node scripts/check.js" test
```

## Development

### Build

```bash
yarn build
```

### Test

```bash
# All tests
yarn test

# Unit tests only
yarn lint:test-unit

# E2E tests only
yarn lint:test-e2e
```

### Lint & Type Check

```bash
# Run all quality checks
yarn lint

# Individual checks
yarn lint:eslint
yarn lint:ts
yarn lint:knip
```

### Quality Check (Using the Tool Itself)

```bash
# Run all checks in parallel using ai-friendly-runner
yarn air lint lint:ts lint:test-unit lint:test-e2e
```

## Testing

- **Unit Tests**: 100% coverage for core functions
    - `exec-command.test.ts`: Command execution tests
    - `run-commands.test.ts`: Parallel execution tests
    - `reporter.test.ts`: Output formatting tests
    - `parse-args.test.ts`: CLI argument parsing tests

- **E2E Tests**: Integration tests with real command execution
    - `integration.e2e.test.ts`: CLI workflow tests

## Exit Codes

- **0**: All commands completed successfully
- **1**: One or more commands failed or invalid usage

## Error Handling

- **Missing Commands**: Shows error message and usage instructions
- **Command Failures**: Captures stderr/stdout, marks as failed, continues with other commands
- **Fatal Errors**: Logs error and exits with code 1

## Performance

Parallel execution significantly faster than sequential:

- **Sequential**: 3 commands × 1s each = ~3 seconds
- **Parallel** (ai-friendly-runner): 3 commands × 1s each = ~1 second (limited by longest command)

## License

MIT

## Author

Пахомов Андрей Николаевич <andrey.pahomov@ligastavok.ru>

## Repository

<https://github.com/CyberWalrus/ai-friendly-runner>
