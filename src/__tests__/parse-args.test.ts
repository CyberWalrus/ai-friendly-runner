import { cpus } from 'node:os';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { parseArgs } from '../parse-args';

vi.mock('node:os');

describe('parseArgs', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(cpus).mockReturnValue(new Array(8).fill({}) as ReturnType<typeof cpus>);
    });

    it('должен парсить команды без флагов', () => {
        const result = parseArgs(['test:lint', 'test:build']);

        expect(result.commands).toEqual(['test:lint', 'test:build']);
        expect(result.flags.showTime).toBe(true);
        expect(result.flags.showSummary).toBe(true);
        expect(result.flags.stream).toBe(false);
        expect(result.flags.output).toBe('errors');
        expect(result.flags.threads).toBe(7);
    });

    it('должен обработать флаг --help и завершить процесс', () => {
        parseArgs(['--help']);

        expect(mockLog).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('должен обработать короткий флаг -h и завершить процесс', () => {
        parseArgs(['-h']);

        expect(mockLog).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('должен обработать флаг --no-time', () => {
        const result = parseArgs(['--no-time', 'test']);

        expect(result.flags.showTime).toBe(false);
    });

    it('должен обработать короткий флаг -t', () => {
        const result = parseArgs(['-t', 'test']);

        expect(result.flags.showTime).toBe(false);
    });

    it('должен обработать флаг --no-summary', () => {
        const result = parseArgs(['--no-summary', 'test']);

        expect(result.flags.showSummary).toBe(false);
    });

    it('должен обработать короткий флаг -s', () => {
        const result = parseArgs(['-s', 'test']);

        expect(result.flags.showSummary).toBe(false);
    });

    it('должен обработать флаг --stream', () => {
        const result = parseArgs(['--stream', 'test']);

        expect(result.flags.stream).toBe(true);
    });

    it('должен обработать короткий флаг -w', () => {
        const result = parseArgs(['-w', 'test']);

        expect(result.flags.stream).toBe(true);
    });

    it('должен обработать флаг --output с коротким синтаксисом', () => {
        const result = parseArgs(['-o', 'full', 'test']);

        expect(result.flags.output).toBe('full');
    });

    it('должен обработать флаг --output с длинным синтаксисом', () => {
        const result = parseArgs(['--output=none', 'test']);

        expect(result.flags.output).toBe('none');
    });

    it('должен завершить с ошибкой при невалидном значении --output', () => {
        parseArgs(['-o', 'invalid', 'test']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Invalid output format'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен завершить с ошибкой при отсутствии значения --output', () => {
        parseArgs(['-o']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('requires a value'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен обработать флаг --threads с коротким синтаксисом', () => {
        const result = parseArgs(['-n', '4', 'test']);

        expect(result.flags.threads).toBe(4);
    });

    it('должен обработать флаг --threads с длинным синтаксисом', () => {
        const result = parseArgs(['--threads=8', 'test']);

        expect(result.flags.threads).toBe(8);
    });

    it('должен завершить с ошибкой при невалидном значении --threads', () => {
        parseArgs(['-n', 'abc', 'test']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Invalid threads value'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен завершить с ошибкой при threads < 1', () => {
        parseArgs(['-n', '0', 'test']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Threads must be >= 1'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен завершить с ошибкой при отсутствии значения --threads', () => {
        parseArgs(['-n']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('requires a value'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен завершить с ошибкой при неизвестном флаге', () => {
        parseArgs(['--unknown', 'test']);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Unknown flag'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен завершить с ошибкой при отсутствии команд', () => {
        parseArgs([]);

        expect(mockError).toHaveBeenCalledWith(expect.stringContaining('No commands provided'));
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('должен обработать несколько флагов одновременно', () => {
        const result = parseArgs(['-t', '-s', '-w', '-o', 'full', '-n', '2', 'test1', 'test2']);

        expect(result.flags.showTime).toBe(false);
        expect(result.flags.showSummary).toBe(false);
        expect(result.flags.stream).toBe(true);
        expect(result.flags.output).toBe('full');
        expect(result.flags.threads).toBe(2);
        expect(result.commands).toEqual(['test1', 'test2']);
    });

    it('должен корректно обрабатывать команды после флагов', () => {
        const result = parseArgs(['--stream', 'test:lint', 'test:build', 'test:type']);

        expect(result.commands).toEqual(['test:lint', 'test:build', 'test:type']);
        expect(result.flags.stream).toBe(true);
    });

    it('должен корректно обрабатывать команды с пробелами в кавычках', () => {
        const result = parseArgs(['yarn tsc --noEmit', 'npm run test']);

        expect(result.commands).toEqual(['yarn tsc --noEmit', 'npm run test']);
    });
});
