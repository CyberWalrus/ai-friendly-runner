import { cpus } from 'node:os';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDefaultThreads } from '../get-default-threads';

vi.mock('node:os');

describe('getDefaultThreads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен возвращать количество ядер CPU минус 1', () => {
        vi.mocked(cpus).mockReturnValue(new Array(8).fill({}) as ReturnType<typeof cpus>);

        const result = getDefaultThreads();

        expect(result).toBe(7);
    });

    it('должен возвращать минимум 1 поток при 1 ядре', () => {
        vi.mocked(cpus).mockReturnValue(new Array(1).fill({}) as ReturnType<typeof cpus>);

        const result = getDefaultThreads();

        expect(result).toBe(1);
    });

    it('должен возвращать минимум 1 поток при 2 ядрах', () => {
        vi.mocked(cpus).mockReturnValue(new Array(2).fill({}) as ReturnType<typeof cpus>);

        const result = getDefaultThreads();

        expect(result).toBe(1);
    });

    it('должен правильно обрабатывать большое количество ядер', () => {
        vi.mocked(cpus).mockReturnValue(new Array(16).fill({}) as ReturnType<typeof cpus>);

        const result = getDefaultThreads();

        expect(result).toBe(15);
    });
});
