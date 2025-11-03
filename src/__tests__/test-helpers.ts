import type { Flags } from '../types';

/** Создает дефолтные флаги для тестов */
export function createDefaultFlags(overrides?: Partial<Flags>): Flags {
    return {
        output: 'errors',
        showSummary: true,
        showTime: true,
        stream: false,
        threads: 4,
        ...overrides,
    };
}
