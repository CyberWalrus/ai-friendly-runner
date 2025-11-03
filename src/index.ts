#!/usr/bin/env node
import pc from 'picocolors';

import { parseArgs } from './parse-args';
import { run } from './run';

run(parseArgs(process.argv.slice(2))).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(pc.red('Fatal error:'), message);
    process.exit(1);
});
