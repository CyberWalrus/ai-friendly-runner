import { describe, expect, it } from 'vitest';

import { DEFAULT_OUTPUT_FORMAT, HELP_TEXT, MIN_THREADS, OUTPUT_FORMATS } from '../constants';

describe('constants', () => {
    it('должен иметь правильное значение DEFAULT_OUTPUT_FORMAT', () => {
        expect(DEFAULT_OUTPUT_FORMAT).toBe('errors');
    });

    it('должен иметь правильное значение MIN_THREADS', () => {
        expect(MIN_THREADS).toBe(1);
    });

    it('должен содержать все форматы вывода в OUTPUT_FORMATS', () => {
        expect(OUTPUT_FORMATS).toEqual(['none', 'errors', 'full']);
    });

    it('должен иметь HELP_TEXT с описанием всех флагов', () => {
        expect(HELP_TEXT).toContain('Usage: air');
        expect(HELP_TEXT).toContain('-h, --help');
        expect(HELP_TEXT).toContain('-w, --stream');
        expect(HELP_TEXT).toContain('-s, --no-summary');
        expect(HELP_TEXT).toContain('-o, --output');
        expect(HELP_TEXT).toContain('-t, --no-time');
        expect(HELP_TEXT).toContain('-n, --threads');
        expect(HELP_TEXT).toContain('Examples (without quotes');
        expect(HELP_TEXT).toContain('Examples (with quotes');
    });
});
