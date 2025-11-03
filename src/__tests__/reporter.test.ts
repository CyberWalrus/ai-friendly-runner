import pc from 'picocolors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { printReport } from '../reporter';
import type { CommandResult } from '../types';
import { createDefaultFlags } from './test-helpers';

describe('printReport', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('должен вывести статусы команд с XML тегами только для детального вывода ошибок', () => {
        const results: CommandResult[] = [
            {
                command: 'test1',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: 'ok',
            },
            {
                command: 'test2',
                duration: 200,
                isSuccess: false,
                stderr: 'error',
                stdout: '',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith('');
        expect(console.log).toHaveBeenCalledWith(`${pc.green('✅')} test1 ${pc.dim('(100ms)')}`);
        expect(console.log).not.toHaveBeenCalledWith('<test1>');
        expect(console.log).toHaveBeenCalledWith(`${pc.red('❌')} test2 ${pc.dim('(200ms)')}`);
        expect(console.log).toHaveBeenCalledWith('<test2>');
        expect(console.log).toHaveBeenCalledWith('</test2>');
        expect(console.log).toHaveBeenCalledWith(pc.red('❌ test2:'));
    });

    it('должен показать детали только для ошибок с XML тегами после summary', () => {
        const results: CommandResult[] = [
            {
                command: 'success',
                duration: 50,
                isSuccess: true,
                stderr: '',
                stdout: 'all good',
            },
            {
                command: 'failure',
                duration: 150,
                isSuccess: false,
                stderr: 'error occurred',
                stdout: 'partial output',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith('<failure>');
        expect(console.log).toHaveBeenCalledWith('</failure>');
        expect(console.log).toHaveBeenCalledWith(pc.red('❌ failure:'));
        expect(console.log).toHaveBeenCalledWith('error occurred');
        expect(console.log).toHaveBeenCalledWith('partial output');
        expect(console.log).not.toHaveBeenCalledWith('all good');

        const allCalls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
        const summaryIndex = allCalls.findIndex((call) => String(call[0]).includes('Summary:'));
        const failureTagIndex = allCalls.findIndex((call) => call[0] === '<failure>');

        expect(summaryIndex).toBeGreaterThan(-1);
        expect(failureTagIndex).toBeGreaterThan(summaryIndex);
    });

    it('должен вывести итоговую статистику', () => {
        const results: CommandResult[] = [
            {
                command: 'test1',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
            {
                command: 'test2',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
            {
                command: 'test3',
                duration: 100,
                isSuccess: false,
                stderr: 'err',
                stdout: '',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith(pc.red('Summary: 2/3 passed'));
    });

    it('должен использовать правильные цвета', () => {
        const allSuccess: CommandResult[] = [
            {
                command: 'test1',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
        ];

        printReport(allSuccess, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith(pc.green('Summary: 1/1 passed'));

        vi.clearAllMocks();

        const hasFailure: CommandResult[] = [
            {
                command: 'test1',
                duration: 100,
                isSuccess: false,
                stderr: 'err',
                stdout: '',
            },
        ];

        printReport(hasFailure, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith(pc.red('Summary: 0/1 passed'));
    });

    it('должен обработать пустой массив', () => {
        const results: CommandResult[] = [];

        printReport(results, createDefaultFlags());

        expect(console.log).not.toHaveBeenCalled();
    });

    it('должен обработать результаты без stderr и stdout', () => {
        const results: CommandResult[] = [
            {
                command: 'empty',
                duration: 10,
                isSuccess: false,
                stderr: '',
                stdout: '',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith(pc.red('❌ empty:'));
        expect(console.log).toHaveBeenCalledWith('');
    });

    it('должен вывести общее время выполнения (максимальное из всех команд)', () => {
        const results: CommandResult[] = [
            {
                command: 'fast',
                duration: 50,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
            {
                command: 'slow',
                duration: 300,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
            {
                command: 'medium',
                duration: 150,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).toHaveBeenCalledWith(pc.dim('Total time: 300ms'));
    });

    it('не должен выводить XML теги для успешных команд', () => {
        const results: CommandResult[] = [
            {
                command: 'success1',
                duration: 100,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
            {
                command: 'success2',
                duration: 200,
                isSuccess: true,
                stderr: '',
                stdout: '',
            },
        ];

        printReport(results, createDefaultFlags());

        expect(console.log).not.toHaveBeenCalledWith('<success1>');
        expect(console.log).not.toHaveBeenCalledWith('</success1>');
        expect(console.log).not.toHaveBeenCalledWith('<success2>');
        expect(console.log).not.toHaveBeenCalledWith('</success2>');
    });
});
