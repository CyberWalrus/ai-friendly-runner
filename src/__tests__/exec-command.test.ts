import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDefaultFlags } from './test-helpers';

const mockedExecAsync = vi.fn();

vi.mock('node:child_process');
vi.mock('node:util', () => ({
    promisify: () => mockedExecAsync,
}));

const { execCommand } = await import('../exec-command');

describe('execCommand', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('должен выполнить команду успешно', async () => {
        mockedExecAsync.mockResolvedValue({
            stderr: '',
            stdout: 'test output',
        });

        const result = await execCommand('test', createDefaultFlags());

        expect(result.command).toBe('test');
        expect(result.isSuccess).toBe(true);
        expect(result.stdout).toBe('test output');
        expect(result.stderr).toBe('');
        expect(result.duration).toBeGreaterThanOrEqual(0);
        expect(mockedExecAsync).toHaveBeenCalledWith(
            'npm run test',
            expect.objectContaining({
                encoding: 'utf8',
                shell: expect.any(String),
            }),
        );
    });

    it('должен обработать ошибку команды', async () => {
        const error = Object.assign(new Error('Command failed'), {
            stderr: 'error message',
            stdout: 'partial output',
        });

        mockedExecAsync.mockRejectedValue(error);

        const result = await execCommand('failing-test', createDefaultFlags());

        expect(result.command).toBe('failing-test');
        expect(result.isSuccess).toBe(false);
        expect(result.stderr).toBe('error message');
        expect(result.stdout).toBe('partial output');
        expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('должен измерить время выполнения', async () => {
        vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

        mockedExecAsync.mockImplementation(() => {
            vi.advanceTimersByTime(100);

            return Promise.resolve({
                stderr: '',
                stdout: '',
            });
        });

        const result = await execCommand('slow-test', createDefaultFlags());

        expect(result.duration).toBeGreaterThanOrEqual(100);
    });

    it('должен обработать ошибку без stderr и stdout', async () => {
        mockedExecAsync.mockRejectedValue({});

        const result = await execCommand('empty-error', createDefaultFlags());

        expect(result.command).toBe('empty-error');
        expect(result.isSuccess).toBe(false);
        expect(result.stderr).toBe('');
        expect(result.stdout).toBe('');
    });
});
