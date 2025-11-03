import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { beforeAll, describe, expect, it } from 'vitest';

const execAsync = promisify(exec);

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(currentDir, '../..');
const distPath = join(rootDir, 'dist/index.js');

describe('Integration E2E Tests', () => {
    beforeAll(async () => {
        if (!existsSync(distPath)) {
            await execAsync('yarn build', { cwd: rootDir });
        }
    }, 30_000);

    it('должен запустить команду с выводом результата и правильным exit code', async () => {
        const { stdout, stderr } = await execAsync('node dist/index.js "test:pass-fast"', {
            cwd: rootDir,
        });

        expect(stdout).toContain('Running: test:pass-fast');
        expect(stdout).toContain('test:pass-fast');
        expect(stdout).toMatch(/\(\d+ms\)/);
        expect(stdout).toContain('Summary:');
        expect(stdout).toContain('passed');
        expect(stderr).toBe('');
    }, 15_000);

    it('должен показать ошибку при отсутствии команд', async () => {
        try {
            await execAsync('node dist/index.js', {
                cwd: rootDir,
            });
            throw new Error('Expected command to fail');
        } catch (error) {
            const err = error as { stderr: string; code?: number };
            expect(err.stderr).toContain('Error: No commands provided');
            expect(err.stderr).toContain('Usage: air');
            expect(err.code).toBe(1);
        }
    }, 15_000);

    it('должен обработать несуществующую команду с exit code 1', async () => {
        try {
            await execAsync('node dist/index.js "nonexistent-command"', {
                cwd: rootDir,
            });
        } catch (error) {
            const err = error as { stdout: string; code?: number };
            expect(err.stdout).toContain('nonexistent-command');
            expect(err.stdout).toContain('❌');
            expect(err.code).toBe(1);
        }
    }, 15_000);

    it('не должен выводить XML теги для успешной команды', async () => {
        const { stdout } = await execAsync('node dist/index.js "test:pass-fast"', {
            cwd: rootDir,
        });

        expect(stdout).not.toContain('<test:pass-fast>');
        expect(stdout).not.toContain('</test:pass-fast>');
        expect(stdout).toContain('✅');
        expect(stdout).toMatch(/\(\d+ms\)/);
    }, 15_000);

    it('должен выводить XML теги для упавшей команды в детальном блоке', async () => {
        try {
            await execAsync('node dist/index.js "test:fail-fast"', {
                cwd: rootDir,
            });
        } catch (error) {
            const err = error as { stdout: string };

            const openTags = (err.stdout.match(/<test:fail-fast>/g) || []).length;
            const closeTags = (err.stdout.match(/<\/test:fail-fast>/g) || []).length;

            expect(openTags).toBe(1);
            expect(closeTags).toBe(1);
            expect(err.stdout).toContain('❌');
            expect(err.stdout).toContain('Summary:');
        }
    }, 15_000);

    it('должен выводить XML теги только для упавших команд в детальном блоке', async () => {
        try {
            await execAsync('node dist/index.js "test:pass-fast" "test:fail-fast" "test:fail-fast"', {
                cwd: rootDir,
            });
        } catch (error) {
            const err = error as { stdout: string };

            expect(err.stdout).not.toContain('<test:pass-fast>');
            expect(err.stdout).not.toContain('</test:pass-fast>');
            expect(err.stdout).toContain('<test:fail-fast>');
            expect(err.stdout).toContain('</test:fail-fast>');

            const failTags = (err.stdout.match(/<test:fail-fast>/g) || []).length;
            expect(failTags).toBe(2);

            expect(err.stdout).toMatch(/Summary: 1\/3 passed/);
        }
    }, 15_000);

    it('должен выводить счетчик в summary', async () => {
        const { stdout } = await execAsync('node dist/index.js "test:pass-fast"', {
            cwd: rootDir,
        });

        expect(stdout).toMatch(/Summary: \d+\/\d+ passed/);
        expect(stdout).toContain('Summary: 1/1 passed');
    }, 15_000);

    it('должен выводить общее время выполнения', async () => {
        const { stdout } = await execAsync('node dist/index.js "test:pass-fast" "test:pass-slow"', {
            cwd: rootDir,
        });

        expect(stdout).toMatch(/Total time: \d+ms/);
    }, 15_000);

    it('должен иметь минимальные накладные расходы при запуске команд', async () => {
        const fastCommand = "node -e 'console.log(123)'";
        const iterations = 5;
        const overheadResults: number[] = [];

        for (let i = 0; i < iterations; i += 1) {
            const airStart = Date.now();

            await execAsync(`node dist/index.js "${fastCommand}"`, {
                cwd: rootDir,
            });
            const airTime = Date.now() - airStart;

            const directStart = Date.now();

            await execAsync(fastCommand, {
                cwd: rootDir,
            });
            const directTime = Date.now() - directStart;

            const overhead = airTime - directTime;

            overheadResults.push(overhead);
        }

        const avgOverhead = overheadResults.reduce((sum, val) => sum + val, 0) / iterations;
        const maxOverhead = Math.max(...overheadResults);

        expect(avgOverhead).toBeLessThan(100);
        expect(maxOverhead).toBeLessThan(150);
    }, 30_000);

    it('должен работать с флагами --help', async () => {
        const { stdout } = await execAsync('node dist/index.js --help', {
            cwd: rootDir,
        });

        expect(stdout).toContain('Usage: air');
        expect(stdout).toContain('Flags:');
        expect(stdout).toContain('--help');
        expect(stdout).toContain('--stream');
        expect(stdout).toContain('--threads');
        expect(stdout).toContain('Examples (without quotes');
        expect(stdout).toContain('air lint test build');
    }, 15_000);

    it('должен работать с флагами --no-time и --no-summary', async () => {
        const { stdout } = await execAsync('node dist/index.js --no-time --no-summary "test:pass-fast"', {
            cwd: rootDir,
        });

        expect(stdout).not.toMatch(/\(\d+ms\)/);
        expect(stdout).not.toContain('Summary:');
        expect(stdout).not.toContain('Total time:');
    }, 15_000);

    it('должен работать с флагом --output=none', async () => {
        const { stdout } = await execAsync('node dist/index.js --output=none "test:pass-fast"', {
            cwd: rootDir,
        });

        expect(stdout).toContain('Running: test:pass-fast');
        expect(stdout).not.toContain('✅');
        expect(stdout).not.toContain('Summary:');
    }, 15_000);

    it('должен работать с флагом --threads', async () => {
        const { stdout } = await execAsync(
            'node dist/index.js --threads=1 "test:pass-fast" "test:pass-fast" "test:pass-fast"',
            {
                cwd: rootDir,
            },
        );

        expect(stdout).toContain('Running: test:pass-fast, test:pass-fast, test:pass-fast');
        expect(stdout).toContain('Summary: 3/3 passed');
    }, 15_000);

    it('должен запускать прямые команды без npm run', async () => {
        const directCmd = "node -e 'console.log(123)'";
        const { stdout } = await execAsync(`node dist/index.js "${directCmd}" "test:pass-fast"`, {
            cwd: rootDir,
        });

        expect(stdout).toContain('Running:');
        expect(stdout).toContain('Summary: 2/2 passed');
    }, 15_000);
});
