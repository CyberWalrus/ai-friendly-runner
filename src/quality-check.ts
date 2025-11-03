import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import pc from 'picocolors';

const execAsync = promisify(exec);

type CommandResult = {
    command: string;
    duration: number;
    stderr: string;
    stdout: string;
    success: boolean;
};

/** Выполняет одну npm команду и возвращает результат */
async function execCommand(command: string): Promise<CommandResult> {
    const startTime = Date.now();

    try {
        const { stdout, stderr } = await execAsync(`npm run ${command}`);
        const duration = Date.now() - startTime;

        return {
            command,
            duration,
            stderr,
            stdout,
            success: true,
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const err = error as { stderr?: string; stdout?: string };

        return {
            command,
            duration,
            stderr: err.stderr || '',
            stdout: err.stdout || '',
            success: false,
        };
    }
}

/** Форматирует и выводит отчет о результатах проверок */
function printReport(results: CommandResult[]): void {
    console.log('');

    results.forEach((result) => {
        const status = result.success ? pc.green('✅') : pc.red('❌');
        console.log(`${status} ${result.command} ${pc.dim(`(${result.duration}ms)`)}`);
    });

    const failedResults = results.filter((r) => !r.success);

    if (failedResults.length > 0) {
        console.log('');

        failedResults.forEach((result) => {
            console.log(pc.red(`❌ ${result.command}:`));
            if (result.stderr) {
                console.log(result.stderr);
            }
            if (result.stdout) {
                console.log(result.stdout);
            }
            console.log('');
        });
    }

    const passed = results.filter((r) => r.success).length;
    const total = results.length;
    const summaryText = `Summary: ${passed}/${total} passed`;

    if (passed === total) {
        console.log(pc.green(summaryText));
    } else {
        console.log(pc.red(summaryText));
    }
    console.log('');
}

/** Запускает проверки качества для переданных команд */
async function runQualityCheck(commands: string[]): Promise<void> {
    if (commands.length === 0) {
        console.error(pc.red('Error: No commands provided'));
        console.error('Usage: tsx ./scripts/quality-check.ts <command1> <command2> ...');
        process.exit(1);
    }

    console.log(`\nRunning: ${commands.join(', ')}\n`);

    const results = await Promise.all(commands.map((command) => execCommand(command)));

    printReport(results);

    const allPassed = results.every((r) => r.success);
    process.exit(allPassed ? 0 : 1);
}

const commands = process.argv.slice(2);

runQualityCheck(commands).catch((error) => {
    console.error(pc.red('Fatal error:'), error);
    process.exit(1);
});
