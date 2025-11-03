import { printReport } from './reporter';
import { runCommands } from './run-commands';
import type { RunnerOptions } from './types';

/** Главная функция запуска проверок */
export async function run(options: RunnerOptions): Promise<void> {
    const { commands, flags } = options;

    console.log(`\nRunning: ${commands.join(', ')}\n`);

    const results = await runCommands(commands, flags);
    printReport(results, flags);

    const allPassed = results.every((r) => r.isSuccess);
    process.exit(allPassed ? 0 : 1);
}
