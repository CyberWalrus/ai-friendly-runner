import { defineConfig } from 'tsup';

/** Конфигурация сборки tsup для CLI-инструмента cursor-rules */
export default defineConfig({
    bundle: true,
    clean: true,
    dts: false,
    entry: ['src/cli.ts'],
    esbuildOptions(options) {
        return {
            ...options,
            banner: {
                js: '#!/usr/bin/env node',
            },
        };
    },
    format: ['esm'],
    outDir: 'dist',
    sourcemap: false,
    target: 'node20',
});
