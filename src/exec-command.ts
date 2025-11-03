import { exec, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { promisify } from 'node:util';

import type { CommandResult, Flags } from './types';

const execAsync = promisify(exec);

/** Выполняет команду и возвращает результат */
export async function execCommand(command: string, flags: Flags): Promise<CommandResult> {
    const directCommands = ['yarn', 'npm', 'pnpm', 'npx', 'node', 'cross-env', 'tsx'] as const;

    const shouldRunDirect = directCommands.some((cmd) => command.startsWith(`${cmd} `) || command === cmd);

    const fullCommand = shouldRunDirect ? command : `npm run ${command}`;

    if (flags.stream) {
        const startTime = Date.now();
        const prefix = `[${command.slice(0, 15).padEnd(15)}]: `;

        return new Promise<CommandResult>((resolve, reject) => {
            const child = spawn(fullCommand, {
                shell: true,
                stdio: ['inherit', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';

            if (child.stdout !== null) {
                const stdoutInterface = createInterface({ input: child.stdout });

                stdoutInterface.on('line', (line) => {
                    console.log(`${prefix}${line}`);
                    stdout += `${line}\n`;
                });
            }

            if (child.stderr !== null) {
                const stderrInterface = createInterface({ input: child.stderr });

                stderrInterface.on('line', (line) => {
                    console.error(`${prefix}${line}`);
                    stderr += `${line}\n`;
                });
            }

            child.on('error', (error) => {
                reject(error);
            });

            child.on('close', (code) => {
                resolve({
                    command,
                    duration: Date.now() - startTime,
                    isSuccess: code === 0,
                    stderr,
                    stdout,
                });
            });
        });
    }

    const startTime = Date.now();

    try {
        const { stdout, stderr } = await execAsync(fullCommand, {
            shell: true,
        });

        return {
            command,
            duration: Date.now() - startTime,
            isSuccess: true,
            stderr,
            stdout,
        };
    } catch (error) {
        const err = error as { stderr?: string; stdout?: string };

        return {
            command,
            duration: Date.now() - startTime,
            isSuccess: false,
            stderr: err.stderr ?? '',
            stdout: err.stdout ?? '',
        };
    }
}
