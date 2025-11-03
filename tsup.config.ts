import { defineConfig } from 'tsup';

/** Конфигурация сборки tsup для CLI-инструмента ai-friendly-runner */
export default defineConfig({
    bundle: true,
    clean: true,
    dts: false,
    entry: ['src/index.ts'],
    esbuildOptions(options) {
        return {
            ...options,
            banner: {
                js: '#!/usr/bin/env node',
            },
        };
    },
    format: ['esm'],
    minify: true,
    noExternal: ['picocolors', 'p-limit', 'yocto-queue'],
    outDir: 'dist',
    sourcemap: false,
    splitting: false,
    target: 'node20',
    treeshake: true,
});
