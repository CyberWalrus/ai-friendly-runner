package cli

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/CyberWalrus/ai-friendly-runner/internal/reporter"
	"github.com/CyberWalrus/ai-friendly-runner/internal/runner"
	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
	"github.com/spf13/cobra"
)

var (
	output    string
	noTime    bool
	noSummary bool
	stream    bool
	threads   int
	showHelp  bool
	version   = "dev"
)

var rootCmd = &cobra.Command{
	Use:   "aifr [flags] <command1> <command2> ...",
	Short: "Parallel npm script runner with AI-optimized output",
	Long: `ai-friendly-runner is a fast CLI tool that runs multiple npm scripts in parallel 
with structured, color-coded output optimized for both AI and human readability.

Built with Go for minimal overhead and maximum performance.`,
	Example: `  # Run multiple npm scripts
  aifr lint test build

  # With custom output format
  aifr --output full lint test

  # Stream output in real-time
  aifr --stream build test

  # Control parallelism
  aifr --threads 4 lint test typecheck`,
	Args: cobra.MinimumNArgs(1),
	RunE: run,
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print version information",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("aifr version %s\n", version)
	},
}

func init() {
	rootCmd.Flags().StringVarP(&output, "output", "o", "errors", "Output format: none | errors | full")
	rootCmd.Flags().BoolVarP(&noTime, "no-time", "t", false, "Hide execution time")
	rootCmd.Flags().BoolVarP(&noSummary, "no-summary", "s", false, "Hide final summary")
	rootCmd.Flags().BoolVarP(&stream, "stream", "w", false, "Enable streaming output with prefixes")
	rootCmd.Flags().IntVarP(&threads, "threads", "n", runner.GetDefaultThreads(), "Number of parallel threads")

	rootCmd.AddCommand(versionCmd)
}

func run(cmd *cobra.Command, args []string) error {
	validOutputs := map[string]bool{"none": true, "errors": true, "full": true}
	if !validOutputs[output] {
		return fmt.Errorf("invalid output format: %s (valid: none, errors, full)", output)
	}

	if threads < 1 {
		return fmt.Errorf("threads must be >= 1, got: %d", threads)
	}

	ctx := cmd.Context()

	flags := types.Flags{
		Output:      output,
		ShowSummary: !noSummary,
		ShowTime:    !noTime,
		Stream:      stream,
		Threads:     threads,
	}

	reporter.PrintRunning(args)

	results := runner.RunCommands(ctx, args, flags)

	reporter.PrintReport(results, flags)

	if !reporter.AllPassed(results) {
		os.Exit(1)
	}

	return nil
}

// Execute запускает CLI приложение с signal handling
func Execute() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	return rootCmd.ExecuteContext(ctx)
}
