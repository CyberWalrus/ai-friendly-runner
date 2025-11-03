import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import importPlugin from 'eslint-plugin-import';

/** Конфигурация ESLint для проверки неиспользуемых экспортов */
export const UNUSED_IMPORTS_CONFIG = [
    {
        ignores: ['**/*.test.ts', '**/__tests__/**', '**/test-setup.ts', 'dist/**', 'node_modules/**'],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: false,
        },
        plugins: {
            import: importPlugin,
        },
        rules: {},
    },
] as const satisfies Linter.Config[];

export default UNUSED_IMPORTS_CONFIG;
