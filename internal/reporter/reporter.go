package reporter

import (
	"fmt"
	"strings"

	"github.com/CyberWalrus/ai-friendly-runner/internal/types"
	"github.com/fatih/color"
)

var (
	green = color.New(color.FgGreen).SprintFunc()
	red   = color.New(color.FgRed).SprintFunc()
	dim   = color.New(color.Faint).SprintFunc()
)

// cleanCommandName удаляет популярные префиксы запускаторов из имени команды
func cleanCommandName(command string) string {
	prefixes := []string{"yarn", "npm", "pnpm", "bun", "npx", "pnpx", "bunx", "bash", "sh", "zsh", "fish"}

	for _, prefix := range prefixes {
		if strings.HasPrefix(command, prefix+" ") {
			return strings.TrimPrefix(command, prefix+" ")
		}
	}

	return command
}

// PrintReport форматирует и выводит отчет о результатах
func PrintReport(results []types.CommandResult, flags types.Flags) {
	if len(results) == 0 {
		return
	}

	if flags.Output == "none" {
		return
	}

	fmt.Println()

	failedResults := []types.CommandResult{}
	passedCount := 0
	maxDuration := int64(0)

	for _, result := range results {
		if !result.IsSuccess {
			failedResults = append(failedResults, result)
		} else {
			passedCount++
		}

		if result.Duration.Milliseconds() > maxDuration {
			maxDuration = result.Duration.Milliseconds()
		}
	}

	for _, result := range results {
		status := green("✅")
		if !result.IsSuccess {
			status = red("❌")
		}

		timeStr := ""
		if flags.ShowTime {
			timeStr = fmt.Sprintf(" %s", dim(fmt.Sprintf("(%dms)", result.Duration.Milliseconds())))
		}

		cleanedCommand := cleanCommandName(result.Command)

		if result.IsSuccess {
			if flags.Output == "full" {
				fmt.Printf("<%s>\n", result.Command)
				fmt.Printf("%s %s%s\n", status, cleanedCommand, timeStr)
				if result.Stdout != "" {
					fmt.Print(result.Stdout)
				}
				if result.Stderr != "" {
					fmt.Print(result.Stderr)
				}
				fmt.Printf("</%s>\n", result.Command)
			} else {
				fmt.Printf("%s %s%s\n", status, cleanedCommand, timeStr)
			}
		} else {
			fmt.Printf("%s %s%s\n", status, cleanedCommand, timeStr)
		}
	}

	if flags.ShowSummary {
		totalCount := len(results)
		summaryText := fmt.Sprintf("Summary: %d/%d passed", passedCount, totalCount)

		if passedCount == totalCount {
			fmt.Println(green(summaryText))
		} else {
			fmt.Println(red(summaryText))
		}
	}

	if flags.ShowTime {
		fmt.Println(dim(fmt.Sprintf("Total time: %dms", maxDuration)))
	}

	if len(failedResults) > 0 {
		fmt.Println()

		for _, result := range failedResults {
			cleanedCommand := cleanCommandName(result.Command)
			fmt.Printf("<%s>\n", result.Command)
			fmt.Printf("%s %s:\n", red("❌"), cleanedCommand)
			if result.Stderr != "" {
				fmt.Print(result.Stderr)
			}
			if result.Stdout != "" {
				fmt.Print(result.Stdout)
			}
			fmt.Printf("</%s>\n", result.Command)
			fmt.Println()
		}
	}

	fmt.Println()
}

// PrintRunning выводит список запускаемых команд
func PrintRunning(commands []string) {
	fmt.Printf("\nRunning: %s\n", strings.Join(commands, ", "))
}

// AllPassed проверяет, все ли команды выполнились успешно
func AllPassed(results []types.CommandResult) bool {
	for _, result := range results {
		if !result.IsSuccess {
			return false
		}
	}
	return true
}
