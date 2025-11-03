import pc from 'picocolors';

import { DEFAULT_OUTPUT_FORMAT, MIN_THREADS, OUTPUT_FORMATS } from './constants';
import { getDefaultThreads } from './get-default-threads';
import { showHelp } from './show-help';
import type { Flags, OutputFormat } from './types';

/** Парсит аргументы командной строки */
export function parseArgs(argv: string[]): { commands: string[]; flags: Flags } {
    const flags: Flags = {
        output: DEFAULT_OUTPUT_FORMAT,
        showSummary: true,
        showTime: true,
        stream: false,
        threads: getDefaultThreads(),
    };

    const result = argv.reduce<{ commands: string[]; skip: boolean }>(
        (acc, arg, index) => {
            if (acc.skip) {
                return { ...acc, skip: false };
            }

            if (arg === '-h' || arg === '--help') {
                showHelp();
            }

            if (arg === '-t' || arg === '--no-time') {
                flags.showTime = false;

                return acc;
            }

            if (arg === '-s' || arg === '--no-summary') {
                flags.showSummary = false;

                return acc;
            }

            if (arg === '-w' || arg === '--stream') {
                flags.stream = true;

                return acc;
            }

            if (arg === '-o' || arg.startsWith('--output')) {
                let value: string | null = null;

                if (arg === '-o') {
                    value = argv[index + 1] ?? null;
                } else if (arg.startsWith('--output=')) {
                    value = arg.slice(9);
                }

                if (value === null) {
                    console.error(pc.red('Error: -o/--output requires a value'));
                    console.error('Valid values: none, errors, full');
                    process.exit(1);
                }

                if (!OUTPUT_FORMATS.includes(value as OutputFormat)) {
                    console.error(pc.red(`Error: Invalid output format: ${value}`));
                    console.error('Valid values: none, errors, full');
                    process.exit(1);
                }

                flags.output = value as OutputFormat;

                return arg === '-o' ? { ...acc, skip: true } : acc;
            }

            if (arg === '-n' || arg.startsWith('--threads')) {
                let value: string | null = null;

                if (arg === '-n') {
                    value = argv[index + 1] ?? null;
                } else if (arg.startsWith('--threads=')) {
                    value = arg.slice(10);
                }

                if (value === null) {
                    console.error(pc.red('Error: -n/--threads requires a value'));
                    process.exit(1);
                }

                const threads = Number.parseInt(value, 10);

                if (Number.isNaN(threads)) {
                    console.error(pc.red(`Error: Invalid threads value: ${value}`));
                    console.error('Value must be a number');
                    process.exit(1);
                }

                if (threads < MIN_THREADS) {
                    console.error(pc.red(`Error: Threads must be >= ${MIN_THREADS}, got: ${threads}`));
                    process.exit(1);
                }

                flags.threads = threads;

                return arg === '-n' ? { ...acc, skip: true } : acc;
            }

            if (arg.startsWith('-')) {
                console.error(pc.red(`Error: Unknown flag: ${arg}`));
                console.error('Use --help to see available flags');
                process.exit(1);
            }

            return { ...acc, commands: [...acc.commands, arg] };
        },
        { commands: [], skip: false },
    );

    if (result.commands.length === 0) {
        console.error(pc.red('Error: No commands provided'));
        console.error('Usage: air [flags] "command1" "command2" ...');
        console.error('Use --help for more information');
        process.exit(1);
    }

    return { commands: result.commands, flags };
}
