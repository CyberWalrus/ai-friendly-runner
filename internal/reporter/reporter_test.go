package reporter

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
)

func captureOutput(f func()) string {
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	f()

	w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	io.Copy(&buf, r)
	return buf.String()
}

func TestPrintReport_EmptyResults(t *testing.T) {
	results := []types.CommandResult{}
	flags := types.Flags{Output: "errors"}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if output != "" {
		t.Errorf("Expected empty output for empty results, got: %q", output)
	}
}

func TestPrintReport_NoneOutput(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: true, Duration: 100 * time.Millisecond},
	}
	flags := types.Flags{Output: "none"}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if output != "" {
		t.Errorf("Expected empty output for 'none' format, got: %q", output)
	}
}

func TestPrintReport_SuccessCommand(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: true, Duration: 100 * time.Millisecond, Stdout: "test passed"},
	}
	flags := types.Flags{
		Output:      "errors",
		ShowSummary: true,
		ShowTime:    true,
	}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if !strings.Contains(output, "✅") {
		t.Error("Output should contain success indicator ✅")
	}

	if !strings.Contains(output, "test") {
		t.Error("Output should contain command name")
	}

	if !strings.Contains(output, "100ms") {
		t.Error("Output should contain duration")
	}

	if !strings.Contains(output, "1/1 passed") {
		t.Error("Output should contain summary")
	}
}

func TestPrintReport_FailedCommand(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: false, Duration: 50 * time.Millisecond, Stderr: "error occurred"},
	}
	flags := types.Flags{
		Output:      "errors",
		ShowSummary: true,
		ShowTime:    true,
	}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if !strings.Contains(output, "❌") {
		t.Error("Output should contain failure indicator ❌")
	}

	if !strings.Contains(output, "<test>") {
		t.Error("Output should contain XML opening tag")
	}

	if !strings.Contains(output, "</test>") {
		t.Error("Output should contain XML closing tag")
	}

	if !strings.Contains(output, "error occurred") {
		t.Error("Output should contain error message")
	}

	if !strings.Contains(output, "0/1 passed") {
		t.Error("Output should contain failed summary")
	}
}

func TestPrintReport_FullOutput(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: true, Duration: 100 * time.Millisecond, Stdout: "all tests passed"},
	}
	flags := types.Flags{
		Output:      "full",
		ShowSummary: false,
		ShowTime:    false,
	}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if !strings.Contains(output, "<test>") {
		t.Error("Full output should contain XML opening tag for success")
	}

	if !strings.Contains(output, "</test>") {
		t.Error("Full output should contain XML closing tag for success")
	}

	if !strings.Contains(output, "all tests passed") {
		t.Error("Full output should contain stdout")
	}
}

func TestPrintReport_NoTime(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: true, Duration: 100 * time.Millisecond},
	}
	flags := types.Flags{
		Output:   "errors",
		ShowTime: false,
	}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if strings.Contains(output, "ms") {
		t.Error("Output should not contain timing when ShowTime is false")
	}
}

func TestPrintReport_NoSummary(t *testing.T) {
	results := []types.CommandResult{
		{Command: "test", IsSuccess: true, Duration: 100 * time.Millisecond},
	}
	flags := types.Flags{
		Output:      "errors",
		ShowSummary: false,
	}

	output := captureOutput(func() {
		PrintReport(results, flags)
	})

	if strings.Contains(output, "passed") || strings.Contains(output, "Summary") {
		t.Error("Output should not contain summary when ShowSummary is false")
	}
}

func TestAllPassed(t *testing.T) {
	tests := []struct {
		name    string
		results []types.CommandResult
		want    bool
	}{
		{
			name: "все успешны",
			results: []types.CommandResult{
				{IsSuccess: true},
				{IsSuccess: true},
			},
			want: true,
		},
		{
			name: "одна неудачная",
			results: []types.CommandResult{
				{IsSuccess: true},
				{IsSuccess: false},
			},
			want: false,
		},
		{
			name:    "пустой список",
			results: []types.CommandResult{},
			want:    true,
		},
		{
			name: "все неудачные",
			results: []types.CommandResult{
				{IsSuccess: false},
				{IsSuccess: false},
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := AllPassed(tt.results)
			if got != tt.want {
				t.Errorf("AllPassed() = %v, want %v", got, tt.want)
			}
		})
	}
}
