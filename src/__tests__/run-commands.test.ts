import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { execCommand } from '../exec-command';
import { runCommands } from '../run-commands';
import { createDefaultFlags } from './test-helpers';

vi.mock('../exec-command');

const mockedExecCommand = vi.mocked(execCommand);

describe('runCommands', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('должен запустить команды параллельно', async () => {
        mockedExecCommand.mockImplementation((command) =>
            Promise.resolve({
                command,
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: 'output',
            }),
        );

        const commands = ['test1', 'test2', 'test3'];
        const results = await runCommands(commands, createDefaultFlags());

        expect(results).toHaveLength(3);
        expect(mockedExecCommand).toHaveBeenCalledTimes(3);
        expect(mockedExecCommand).toHaveBeenCalledWith('test1', expect.any(Object));
        expect(mockedExecCommand).toHaveBeenCalledWith('test2', expect.any(Object));
        expect(mockedExecCommand).toHaveBeenCalledWith('test3', expect.any(Object));
    });

    it('должен вернуть результаты всех команд', async () => {
        mockedExecCommand
            .mockResolvedValueOnce({
                command: 'cmd1',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: 'out1',
            })
            .mockResolvedValueOnce({
                command: 'cmd2',
                duration: 200,
                isSuccess: false,
                stderr: 'err2',
                stdout: '',
            })
            .mockResolvedValueOnce({
                command: 'cmd3',
                duration: 150,
                isSuccess: true,
                stderr: '',
                stdout: 'out3',
            });

        const results = await runCommands(['cmd1', 'cmd2', 'cmd3'], createDefaultFlags());

        expect(results[0].command).toBe('cmd1');
        expect(results[0].isSuccess).toBe(true);
        expect(results[1].command).toBe('cmd2');
        expect(results[1].isSuccess).toBe(false);
        expect(results[2].command).toBe('cmd3');
        expect(results[2].isSuccess).toBe(true);
    });

    it('должен обработать пустой массив команд', async () => {
        const results = await runCommands([], createDefaultFlags());

        expect(results).toHaveLength(0);
        expect(mockedExecCommand).not.toHaveBeenCalled();
    });

    it('должен выполнять команды через Promise.all', async () => {
        let callCount = 0;
        mockedExecCommand.mockImplementation((command) => {
            callCount += 1;

            return Promise.resolve({
                command,
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: '',
            });
        });

        await runCommands(['test1', 'test2', 'test3'], createDefaultFlags());

        expect(callCount).toBe(3);
    });

    it('должен обработать ошибку одной команды', async () => {
        mockedExecCommand
            .mockResolvedValueOnce({
                command: 'success',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: 'ok',
            })
            .mockResolvedValueOnce({
                command: 'failure',
                duration: 50,
                isSuccess: false,
                stderr: 'error occurred',
                stdout: '',
            });

        const results = await runCommands(['success', 'failure'], createDefaultFlags());

        expect(results).toHaveLength(2);
        expect(results[0].isSuccess).toBe(true);
        expect(results[1].isSuccess).toBe(false);
        expect(results[1].stderr).toBe('error occurred');
    });
});
