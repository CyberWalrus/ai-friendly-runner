import pLimit from 'p-limit';

import { execCommand } from './exec-command';
import type { CommandResult, Flags } from './types';

/** Запускает команды параллельно с ограничением потоков */
export async function runCommands(commands: string[], flags: Flags): Promise<CommandResult[]> {
    const limit = pLimit(flags.threads);

    return Promise.all(commands.map((command) => limit(() => execCommand(command, flags))));
}
