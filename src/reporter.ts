import pc from 'picocolors';

import type { CommandResult, Flags } from './types';

/** Форматирует и выводит отчет о результатах проверок */
export function printReport(results: readonly CommandResult[], flags: Flags): void {
    if (results.length === 0) {
        return;
    }

    if (flags.output === 'none') {
        return;
    }

    console.log('');

    const failedResults = results.filter((r) => !r.isSuccess);
    const passed = results.length - failedResults.length;
    const maxDuration = results.reduce((max, r) => Math.max(max, r.duration), 0);

    results.forEach((result) => {
        const status = result.isSuccess ? pc.green('✅') : pc.red('❌');
        const timeStr = flags.showTime ? ` ${pc.dim(`(${result.duration}ms)`)}` : '';

        if (result.isSuccess) {
            if (flags.output === 'full') {
                console.log(`<${result.command}>`);
                console.log(`${status} ${result.command}${timeStr}`);
                if (result.stdout) {
                    console.log(result.stdout);
                }
                if (result.stderr) {
                    console.log(result.stderr);
                }
                console.log(`</${result.command}>`);
            } else {
                console.log(`${status} ${result.command}${timeStr}`);
            }
        } else {
            console.log(`${status} ${result.command}${timeStr}`);
        }
    });

    if (flags.showSummary) {
        const total = results.length;
        const summaryText = `Summary: ${passed}/${total} passed`;

        if (passed === total) {
            console.log(pc.green(summaryText));
        } else {
            console.log(pc.red(summaryText));
        }
    }

    if (flags.showTime) {
        console.log(pc.dim(`Total time: ${maxDuration}ms`));
    }

    if (failedResults.length > 0) {
        console.log('');

        failedResults.forEach((result) => {
            console.log(`<${result.command}>`);
            console.log(pc.red(`❌ ${result.command}:`));
            if (result.stderr) {
                console.log(result.stderr);
            }
            if (result.stdout) {
                console.log(result.stdout);
            }
            console.log(`</${result.command}>`);
            console.log('');
        });
    }

    console.log('');
}
