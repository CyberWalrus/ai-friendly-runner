import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showHelp } from '../show-help';

describe('showHelp', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('должен вывести справочную информацию и завершить процесс', () => {
        showHelp();

        expect(mockLog).toHaveBeenCalledOnce();
        expect(mockLog.mock.calls[0]?.[0]).toContain('Usage: air');
        expect(mockLog.mock.calls[0]?.[0]).toContain('Flags:');
        expect(mockLog.mock.calls[0]?.[0]).toContain('--help');
        expect(mockLog.mock.calls[0]?.[0]).toContain('Examples (without quotes');
        expect(mockExit).toHaveBeenCalledWith(0);
    });
});
