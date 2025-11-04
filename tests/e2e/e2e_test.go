package e2e_test

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

var binaryPath string

func TestMain(m *testing.M) {
	tmpDir := os.TempDir()
	binaryPath = filepath.Join(tmpDir, "aifr-test")

	cmd := exec.Command("go", "build", "-o", binaryPath, "../../cmd/aifr")
	if err := cmd.Run(); err != nil {
		panic("Failed to build binary for E2E tests: " + err.Error())
	}

	code := m.Run()

	os.Remove(binaryPath)
	os.Exit(code)
}

func TestBasicExecution(t *testing.T) {
	cmd := exec.Command(binaryPath, "echo hello", "echo world")
	output, err := cmd.CombinedOutput()

	if err != nil {
		t.Fatalf("Command failed: %v\nOutput: %s", err, output)
	}

	outputStr := string(output)

	if !strings.Contains(outputStr, "hello") {
		t.Error("Output missing 'hello'")
	}
	if !strings.Contains(outputStr, "world") {
		t.Error("Output missing 'world'")
	}

	if !strings.Contains(outputStr, "✅") {
		t.Error("Output missing success indicator")
	}

	if !strings.Contains(outputStr, "2/2 passed") {
		t.Error("Output missing correct summary")
	}
}

func TestFailedCommand(t *testing.T) {
	cmd := exec.Command(binaryPath, "exit 1")
	err := cmd.Run()

	if err == nil {
		t.Error("Expected non-zero exit code for failed command")
	}

	exitError, ok := err.(*exec.ExitError)
	if !ok {
		t.Fatalf("Expected ExitError, got %T", err)
	}

	if exitError.ExitCode() != 1 {
		t.Errorf("Expected exit code 1, got %d", exitError.ExitCode())
	}
}

func TestMixedCommands(t *testing.T) {
	cmd := exec.Command(binaryPath, "echo success", "exit 1", "echo another")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if !strings.Contains(outputStr, "✅") {
		t.Error("Output missing success indicator")
	}
	if !strings.Contains(outputStr, "❌") {
		t.Error("Output missing failure indicator")
	}

	if !strings.Contains(outputStr, "2/3 passed") {
		t.Errorf("Output missing correct summary, got: %s", outputStr)
	}
}

func TestXMLTags_FullOutput(t *testing.T) {
	cmd := exec.Command(binaryPath, "--output", "full", "echo test")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if !strings.Contains(outputStr, "<echo test>") {
		t.Error("XML opening tag missing")
	}
	if !strings.Contains(outputStr, "</echo test>") {
		t.Error("XML closing tag missing")
	}
}

func TestXMLTags_FailedCommand(t *testing.T) {
	cmd := exec.Command(binaryPath, "exit 1")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if !strings.Contains(outputStr, "<exit 1>") {
		t.Error("XML opening tag missing for failed command")
	}
	if !strings.Contains(outputStr, "</exit 1>") {
		t.Error("XML closing tag missing for failed command")
	}
}

func TestNoTimeFlag(t *testing.T) {
	cmd := exec.Command(binaryPath, "--no-time", "echo test")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if strings.Contains(outputStr, "ms") {
		t.Error("Output should not contain timing with --no-time flag")
	}
}

func TestNoSummaryFlag(t *testing.T) {
	cmd := exec.Command(binaryPath, "--no-summary", "echo test")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if strings.Contains(outputStr, "passed") {
		t.Error("Output should not contain summary with --no-summary flag")
	}
}

func TestOutputNone(t *testing.T) {
	cmd := exec.Command(binaryPath, "--output", "none", "echo test")
	output, _ := cmd.CombinedOutput()

	outputStr := strings.TrimSpace(string(output))

	if !strings.Contains(outputStr, "Running:") {
		t.Error("Should at least show running commands")
	}

	lines := strings.Split(outputStr, "\n")
	if len(lines) > 3 {
		t.Errorf("Output too verbose for 'none' format: %d lines", len(lines))
	}
}

func TestThreadsFlag(t *testing.T) {
	cmd := exec.Command(binaryPath, "--threads", "2", "echo test1", "echo test2", "echo test3")
	err := cmd.Run()

	if err != nil {
		t.Errorf("Command with --threads flag failed: %v", err)
	}
}

func TestInvalidThreads(t *testing.T) {
	cmd := exec.Command(binaryPath, "--threads", "0", "echo test")
	err := cmd.Run()

	if err == nil {
		t.Error("Expected error for --threads 0")
	}
}

func TestInvalidOutputFormat(t *testing.T) {
	cmd := exec.Command(binaryPath, "--output", "invalid", "echo test")
	err := cmd.Run()

	if err == nil {
		t.Error("Expected error for invalid output format")
	}
}

func TestHelpFlag(t *testing.T) {
	cmd := exec.Command(binaryPath, "--help")
	output, _ := cmd.CombinedOutput()

	outputStr := string(output)

	if !strings.Contains(strings.ToLower(outputStr), "parallel") {
		t.Error("Help output should contain description with 'parallel'")
	}
	if !strings.Contains(outputStr, "Usage:") || !strings.Contains(outputStr, "Flags:") {
		t.Error("Help output should contain usage and flags sections")
	}
}

func TestParallelExecution(t *testing.T) {
	start := time.Now()
	cmd := exec.Command(binaryPath, "sleep 0.2", "sleep 0.2", "sleep 0.2")
	err := cmd.Run()
	duration := time.Since(start)

	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	if duration > 400*time.Millisecond {
		t.Errorf("Commands not running in parallel: took %v (expected ~200ms)", duration)
	}

	if duration < 150*time.Millisecond {
		t.Errorf("Commands finished too quickly: %v", duration)
	}
}

func TestNoCommands(t *testing.T) {
	cmd := exec.Command(binaryPath)
	err := cmd.Run()

	if err == nil {
		t.Error("Expected error when no commands provided")
	}
}
