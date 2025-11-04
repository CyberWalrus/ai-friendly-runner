package runner

import (
	"context"
	"runtime"
	"testing"
	"time"

	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
)

func TestGetDefaultThreads(t *testing.T) {
	threads := GetDefaultThreads()

	if threads < 1 {
		t.Errorf("GetDefaultThreads() = %d, want >= 1", threads)
	}

	expectedMax := runtime.NumCPU()
	if threads > expectedMax {
		t.Errorf("GetDefaultThreads() = %d, want <= %d", threads, expectedMax)
	}
}

func TestRunCommands_Success(t *testing.T) {
	commands := []string{"echo hello", "echo world"}
	flags := types.Flags{
		Output:      "errors",
		ShowSummary: true,
		ShowTime:    true,
		Stream:      false,
		Threads:     2,
	}

	results := RunCommands(context.Background(), commands, flags)

	if len(results) != len(commands) {
		t.Fatalf("Expected %d results, got %d", len(commands), len(results))
	}

	for i, result := range results {
		if !result.IsSuccess {
			t.Errorf("Command %d (%q) failed unexpectedly", i, result.Command)
		}

		if result.Command != commands[i] {
			t.Errorf("Command name mismatch: got %q, want %q", result.Command, commands[i])
		}
	}
}

func TestRunCommands_Mixed(t *testing.T) {
	commands := []string{"echo success", "exit 1"}
	flags := types.Flags{
		Output:  "errors",
		Threads: 2,
	}

	results := RunCommands(context.Background(), commands, flags)

	if len(results) != 2 {
		t.Fatalf("Expected 2 results, got %d", len(results))
	}

	// Первая команда должна быть успешной
	if !results[0].IsSuccess {
		t.Errorf("First command should succeed")
	}

	// Вторая команда должна провалиться
	if results[1].IsSuccess {
		t.Errorf("Second command should fail")
	}
}

func TestRunCommands_Parallel(t *testing.T) {
	// Тест параллельного выполнения
	commands := []string{
		"sleep 0.1",
		"sleep 0.1",
		"sleep 0.1",
	}
	flags := types.Flags{
		Threads: 3,
	}

	start := time.Now()
	results := RunCommands(context.Background(), commands, flags)
	duration := time.Since(start)

	// При параллельном выполнении 3 команд по 0.1с должно быть ~0.1с, а не ~0.3с
	if duration > 250*time.Millisecond {
		t.Errorf("Parallel execution too slow: %v (expected ~100ms)", duration)
	}

	if len(results) != 3 {
		t.Errorf("Expected 3 results, got %d", len(results))
	}
}

func TestRunCommands_ThreadLimit(t *testing.T) {
	// Тест ограничения потоков
	commands := []string{
		"sleep 0.05",
		"sleep 0.05",
		"sleep 0.05",
		"sleep 0.05",
	}
	flags := types.Flags{
		Threads: 2, // Ограничение до 2 потоков
	}

	start := time.Now()
	results := RunCommands(context.Background(), commands, flags)
	duration := time.Since(start)

	// При ограничении в 2 потока, 4 команды по 0.05с должны выполниться за ~0.1с (2 волны)
	if duration < 80*time.Millisecond {
		t.Errorf("Thread limit not working: too fast %v", duration)
	}

	if len(results) != 4 {
		t.Errorf("Expected 4 results, got %d", len(results))
	}
}

func TestRunCommands_EmptyList(t *testing.T) {
	commands := []string{}
	flags := types.Flags{
		Threads: 1,
	}

	results := RunCommands(context.Background(), commands, flags)

	if len(results) != 0 {
		t.Errorf("Expected 0 results for empty commands, got %d", len(results))
	}
}
