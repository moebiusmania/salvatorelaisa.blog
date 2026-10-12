package main

import (
	"errors"
	"os"

	"github.com/charmbracelet/x/term"
	"github.com/spf13/cobra"

	"salvatorelaisa.blog/internal/dashboard"
)

func dashboardCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "dashboard",
		Short: "Admin TUI: stats, recent posts and drafts, quick actions",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			if !term.IsTerminal(os.Stdin.Fd()) || !term.IsTerminal(os.Stdout.Fd()) {
				return errors.New("The dashboard needs an interactive terminal.")
			}
			return dashboard.Run(".")
		},
	}
}
