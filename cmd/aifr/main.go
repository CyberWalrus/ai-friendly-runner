package main

import (
	"os"

	"github.com/CyberWalrus/ai-friendly-runner/pkg/cli"
)

func main() {
	if err := cli.Execute(); err != nil {
		os.Exit(1)
	}
}
