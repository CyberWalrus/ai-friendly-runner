import { cpus } from 'node:os';

import { MIN_THREADS } from './constants';

/** Определяет количество потоков по умолчанию */
export function getDefaultThreads(): number {
    const cpuCount = cpus().length;

    return Math.max(MIN_THREADS, cpuCount - 1);
}
