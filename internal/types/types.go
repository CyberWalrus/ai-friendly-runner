package types

import "time"

// CommandResult представляет результат выполнения команды
type CommandResult struct {
	Command   string
	Duration  time.Duration
	IsSuccess bool
	Stdout    string
	Stderr    string
}

// Flags содержит флаги CLI
type Flags struct {
	Output      string // "none", "errors", "full"
	ShowSummary bool
	ShowTime    bool
	Stream      bool
	Threads     int
}

// RunnerOptions содержит опции для запуска команд
type RunnerOptions struct {
	Commands []string
	Flags    Flags
}


