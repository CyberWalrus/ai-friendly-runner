package executor

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
	"github.com/mattn/go-shellwords"
)

var bufferPool = sync.Pool{
	New: func() interface{} {
		return new(bytes.Buffer)
	},
}

func getBuffer() *bytes.Buffer {
	buf := bufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	return buf
}

func putBuffer(buf *bytes.Buffer) {
	if buf.Cap() > 256*1024 {
		return
	}
	bufferPool.Put(buf)
}

var directCommands = []string{"yarn", "npm", "pnpm", "npx", "node", "go", "python", "cross-env", "tsx"}

func shouldRunDirect(command string) bool {
	for _, cmd := range directCommands {
		if strings.HasPrefix(command, cmd+" ") || command == cmd {
			return true
		}
	}
	return false
}

func determineCommandToRun(command string) string {
	if shouldRunDirect(command) {
		return command
	}
	return command
}

// ExecCommand выполняет команду и возвращает результат
func ExecCommand(command string, flags types.Flags) types.CommandResult {
	return ExecCommandWithContext(context.Background(), command, flags)
}

// ExecCommandWithContext выполняет команду с поддержкой context
func ExecCommandWithContext(ctx context.Context, command string, flags types.Flags) types.CommandResult {
	startTime := time.Now()
	fullCommand := determineCommandToRun(command)

	if flags.Stream {
		return execCommandStreamWithContext(ctx, command, fullCommand, startTime)
	}

	return execCommandBufferedWithContext(ctx, command, fullCommand, startTime)
}

func execCommandStreamWithContext(ctx context.Context, originalCommand, fullCommand string, startTime time.Time) types.CommandResult {
	parts, err := shellwords.Parse(fullCommand)
	if err != nil {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    fmt.Sprintf("Invalid command: %v", err),
		}
	}

	if len(parts) == 0 {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    "Empty command",
		}
	}

	cmd := exec.CommandContext(ctx, parts[0], parts[1:]...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    fmt.Sprintf("Failed to create stdout pipe: %v", err),
		}
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    fmt.Sprintf("Failed to create stderr pipe: %v", err),
		}
	}

	if err := cmd.Start(); err != nil {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    fmt.Sprintf("Failed to start command: %v", err),
		}
	}

	stdoutBuf := getBuffer()
	stderrBuf := getBuffer()
	defer putBuffer(stdoutBuf)
	defer putBuffer(stderrBuf)

	prefix := originalCommand
	if len(prefix) > 15 {
		prefix = prefix[:15]
	}
	prefix = fmt.Sprintf("[%-15s]: ", prefix)

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		stdoutScanner := bufio.NewScanner(stdout)
		for stdoutScanner.Scan() {
			line := stdoutScanner.Text()
			fmt.Println(prefix + line)
			stdoutBuf.WriteString(line)
			stdoutBuf.WriteByte('\n')
		}
	}()

	go func() {
		defer wg.Done()
		stderrScanner := bufio.NewScanner(stderr)
		for stderrScanner.Scan() {
			line := stderrScanner.Text()
			fmt.Println(prefix + line)
			stderrBuf.WriteString(line)
			stderrBuf.WriteByte('\n')
		}
	}()

	wg.Wait()
	err = cmd.Wait()
	duration := time.Since(startTime)

	stdoutStr := stdoutBuf.String()
	stderrStr := stderrBuf.String()

	return types.CommandResult{
		Command:   originalCommand,
		Duration:  duration,
		IsSuccess: err == nil,
		Stdout:    stdoutStr,
		Stderr:    stderrStr,
	}
}

func execCommandBufferedWithContext(ctx context.Context, originalCommand, fullCommand string, startTime time.Time) types.CommandResult {
	parts, err := shellwords.Parse(fullCommand)
	if err != nil {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    fmt.Sprintf("Invalid command: %v", err),
		}
	}

	if len(parts) == 0 {
		return types.CommandResult{
			Command:   originalCommand,
			Duration:  time.Since(startTime),
			IsSuccess: false,
			Stderr:    "Empty command",
		}
	}

	cmd := exec.CommandContext(ctx, parts[0], parts[1:]...)

	stdout := getBuffer()
	stderr := getBuffer()
	defer putBuffer(stdout)
	defer putBuffer(stderr)

	cmd.Stdout = stdout
	cmd.Stderr = stderr

	err = cmd.Run()
	duration := time.Since(startTime)

	stdoutStr := stdout.String()
	stderrStr := stderr.String()

	return types.CommandResult{
		Command:   originalCommand,
		Duration:  duration,
		IsSuccess: err == nil,
		Stdout:    stdoutStr,
		Stderr:    stderrStr,
	}
}
