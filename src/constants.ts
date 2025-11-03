import type { OutputFormat } from './types';

/** Форматы вывода результатов */
export const OUTPUT_FORMATS = ['none', 'errors', 'full'] as const;

/** Формат вывода по умолчанию */
export const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'errors';

/** Минимальное количество потоков */
export const MIN_THREADS = 1;

/** Текст справки */
export const HELP_TEXT = `Usage: air [flags] [command1] [command2] ...

Parallel npm script runner with AI-optimized output format

Flags:
  -h, --help              Show this help
  -t, --no-time           Hide execution time
  -s, --no-summary        Hide final summary
  -o, --output <value>    Output format: none | errors | full (default: errors)
  -w, --stream            Enable streaming output with prefixes
  -n, --threads <num>     Number of parallel threads (default: cpus-1, min: 1)

Examples (without quotes - for simple npm scripts):
  air lint test build
  air lint:ts lint:eslint test:unit

Examples (with quotes - for commands with spaces/flags or direct commands):
  air "lint:ts" "yarn tsc --noEmit"
  air --stream --threads=4 "lint:eslint" "test:unit"
  air -w -s -o full "npm run build" "npm test"
  air "node -e 'console.log(123)'" "test:unit"
  
More:
  air --help

Note: Use quotes when command contains spaces, flags, or special characters. For quotes inside commands, use single quotes.
`;
