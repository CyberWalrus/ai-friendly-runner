/** Результат выполнения команды */
export type CommandResult = {
    /** Название команды */
    command: string;
    /** Длительность выполнения в миллисекундах */
    duration: number;
    /** Флаг успешного выполнения */
    isSuccess: boolean;
    /** Вывод ошибок */
    stderr: string;
    /** Стандартный вывод */
    stdout: string;
};

/** Формат вывода результатов */
export type OutputFormat = 'errors' | 'full' | 'none';

/** Флаги для управления поведением runner */
export type Flags = {
    /** Формат вывода */
    output: OutputFormat;
    /** Показывать итоговый отчет */
    showSummary: boolean;
    /** Показывать время выполнения */
    showTime: boolean;
    /** Включить потоковый вывод */
    stream: boolean;
    /** Количество параллельных потоков */
    threads: number;
};

/** Опции для запуска команд */
export type RunnerOptions = {
    /** Список команд для выполнения */
    commands: string[];
    /** Флаги CLI */
    flags: Flags;
};
