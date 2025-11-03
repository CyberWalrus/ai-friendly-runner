# ai-friendly-runner

Parallel npm script runner with AI-optimized output format.

## Overview

CLI tool for running multiple npm scripts in parallel with structured, color-coded output optimized for AI and human readability. Measures execution time and provides clear success/failure status for each command.

## Installation

```bash
npm install ai-friendly-runner
# or
yarn add ai-friendly-runner
```

## Usage

```bash
# Using 'air' alias
air lint test typecheck

# Using full command name
ai-runner build lint test

# Example output:
# Running: lint, test, typecheck
# 
# ✅ lint (245ms)
# ✅ test (1523ms)
# ❌ typecheck (189ms)
#
# ❌ typecheck:
# src/index.ts:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.
#
# Summary: 2/3 passed
```

## Features

- **Parallel Execution**: Runs all commands simultaneously using `Promise.all`
- **AI-Optimized Output**: Structured format with clear status indicators (✅/❌)
- **Execution Time**: Displays duration for each command in milliseconds
- **Error Details**: Shows stderr and stdout only for failed commands
- **Exit Codes**: Returns 0 on success, 1 on failure (CI/CD friendly)
- **TypeScript**: Fully typed with strict mode enabled

## API

### CLI Command

```bash
air <command1> <command2> <command3> ...
```

- **Arguments**: List of npm script names (without `npm run` prefix)
- **Exit Code**: 0 if all commands succeed, 1 if any command fails

### Programmatic Usage

```typescript
import { run } from 'ai-friendly-runner';

// Run commands programmatically
await run(['lint', 'test', 'typecheck']);
```

## Architecture

### Modules

- **types.ts**: TypeScript type definitions
  - `CommandResult`: Result object with command name, duration, stdout, stderr, isSuccess
  - `RunnerOptions`: Configuration options (parallel, showTime, colors)

- **exec-command.ts**: Single command execution
  - `execCommand(command: string): Promise<CommandResult>`
  - Executes one npm command and returns result with timing

- **run-commands.ts**: Parallel command execution
  - `runCommands(commands: string[]): Promise<CommandResult[]>`
  - Runs multiple commands in parallel using `Promise.all`

- **reporter.ts**: Result formatting and output
  - `printReport(results: readonly CommandResult[]): void`
  - Formats and prints colored output with timing and error details

- **run.ts**: Main runner function
  - `run(commands: string[]): Promise<void>`
  - Validates input, executes commands, prints report, sets exit code

- **index.ts**: CLI entry point
  - Parses command-line arguments and calls `run()`
  - Handles fatal errors and process exit

## Output Format

### Success Case
```
Running: lint, test

✅ lint (142ms)
✅ test (823ms)

Summary: 2/2 passed
```

### Failure Case
```
Running: lint, test, typecheck

✅ lint (156ms)
✅ test (891ms)
❌ typecheck (203ms)

❌ typecheck:
src/utils/helper.ts:15:3 - error TS2322
Type 'number' is not assignable to type 'string'.

Summary: 2/3 passed
```

## Dependencies

- **picocolors**: Terminal color output (minimal, fast)
- **node:child_process**: Command execution
- **node:util**: promisify for async/await

## Development

```bash
# Build
yarn build

# Test
yarn test          # All tests
yarn test:unit     # Unit tests only
yarn test:e2e      # E2E tests only

# Lint & Type Check
yarn lint
yarn typecheck

# Quality Check (all checks in parallel)
yarn air lint typecheck test:unit test:e2e
```

## Testing

- **Unit Tests**: 100% coverage for core functions
  - `exec-command.test.ts`: Command execution tests
  - `run-commands.test.ts`: Parallel execution tests
  - `reporter.test.ts`: Output formatting tests

- **E2E Tests**: Integration tests with real command execution
  - `integration.e2e.test.ts`: CLI workflow tests

## Configuration

No configuration file required. All behavior is controlled via command-line arguments.

## Exit Codes

- **0**: All commands completed successfully
- **1**: One or more commands failed or invalid usage

## Error Handling

- **Missing Commands**: Shows error message and usage instructions
- **Command Failures**: Captures stderr/stdout, marks as failed, continues with other commands
- **Fatal Errors**: Logs error and exits with code 1

## Performance

- Parallel execution significantly faster than sequential
- Example: 3 commands taking 1s each
  - Sequential: ~3 seconds
  - Parallel (ai-friendly-runner): ~1 second

## License

MIT

## Author

Пахомов Андрей Николаевич <andrey.pahomov@ligastavok.ru>

## Repository

https://github.com/CyberWalrus/ai-friendly-runner

