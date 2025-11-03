import type { Linter } from 'eslint';
import { configs } from 'eslint-walrus-config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const baseConfig = [
    ...configs.ignores,
    ...configs.createMainConfig({
        rootDir: resolve(dirname(fileURLToPath(import.meta.url))),
    }),
    {},
] satisfies Linter.Config[];

export default baseConfig;
