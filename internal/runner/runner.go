package runner

import (
	"context"
	"runtime"
	"sync"

	"github.com/CyberWalrus/ai-friendly-runner/internal/executor"
	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
)

// GetDefaultThreads возвращает количество потоков по умолчанию (CPU-1, минимум 1)
func GetDefaultThreads() int {
	threads := runtime.NumCPU() - 1
	if threads < 1 {
		threads = 1
	}
	return threads
}

// RunCommands запускает команды параллельно с ограничением потоков
func RunCommands(ctx context.Context, commands []string, flags types.Flags) []types.CommandResult {
	results := make([]types.CommandResult, len(commands))

	semaphore := make(chan struct{}, flags.Threads)

	var wg sync.WaitGroup

	for i, command := range commands {
		wg.Add(1)

		go func(index int, cmd string) {
			defer wg.Done()

			select {
			case semaphore <- struct{}{}:
				defer func() { <-semaphore }()

				result := executor.ExecCommandWithContext(ctx, cmd, flags)
				results[index] = result

			case <-ctx.Done():
				results[index] = types.CommandResult{
					Command:   cmd,
					IsSuccess: false,
					Stderr:    "Cancelled by user",
					Duration:  0,
				}
			}
		}(i, command)
	}

	wg.Wait()

	return results
}
