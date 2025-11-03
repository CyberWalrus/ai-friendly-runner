import { HELP_TEXT } from './constants';

/** Выводит справку и завершает процесс */
export function showHelp(): never {
    console.log(HELP_TEXT);
    process.exit(0);
}
