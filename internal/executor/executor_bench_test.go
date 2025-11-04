package executor

import (
	"bytes"
	"context"
	"testing"
	"time"

	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
)

func BenchmarkBufferPool(b *testing.B) {
	b.Run("WithPool", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			buf := getBuffer()
			buf.WriteString("test output line\n")
			buf.WriteString("another line\n")
			buf.WriteString("more test data here\n")
			putBuffer(buf)
		}
	})

	b.Run("WithoutPool", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			buf := bytes.NewBuffer(nil)
			buf.WriteString("test output line\n")
			buf.WriteString("another line\n")
			buf.WriteString("more test data here\n")
			// No pooling
		}
	})
}

func BenchmarkCommandExecution(b *testing.B) {
	flags := types.Flags{
		Output:      "none",
		ShowSummary: false,
		ShowTime:    false,
		Stream:      false,
		Threads:     1,
	}

	b.Run("ShortCommand", func(b *testing.B) {
		ctx := context.Background()
		for i := 0; i < b.N; i++ {
			_ = ExecCommandWithContext(ctx, "echo test", flags)
		}
	})

	b.Run("BufferedMode", func(b *testing.B) {
		ctx := context.Background()
		for i := 0; i < b.N; i++ {
			_ = execCommandBufferedWithContext(ctx, "test", "echo test", time.Now())
		}
	})
}

func BenchmarkDetermineCommand(b *testing.B) {
	testCases := []struct {
		name    string
		command string
	}{
		{"DirectCommand", "npm install"},
		{"YarnCommand", "yarn build"},
		{"SimpleCommand", "test"},
	}

	for _, tc := range testCases {
		b.Run(tc.name, func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				_ = determineCommandToRun(tc.command)
			}
		})
	}
}
