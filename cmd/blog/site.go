package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/cobra"

	"salvatorelaisa.blog/internal/gen"
)

func genCmd() *cobra.Command {
	var drafts bool
	cmd := &cobra.Command{
		Use:   "gen",
		Short: "Validate content and write the generated data files (data/gen/)",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			return gen.Run(gen.Options{Root: ".", Drafts: drafts})
		},
	}
	cmd.Flags().BoolVar(&drafts, "drafts", false, "count draft posts as published")
	return cmd
}

func buildCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "build [-- hugo flags]",
		Short: "Build the static site into _site/ (drafts are never included)",
		RunE: func(_ *cobra.Command, args []string) error {
			if err := gen.Run(gen.Options{Root: "."}); err != nil {
				return err
			}
			return hugo(context.Background(), append([]string{"--cleanDestinationDir"}, args...)...)
		},
	}
}

func serveCmd() *cobra.Command {
	var drafts, host bool
	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Dev server with live reload on :3000",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			opts := gen.Options{Root: ".", Drafts: drafts}
			if err := gen.Run(opts); err != nil {
				return err
			}
			ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
			defer stop()
			go watchContent(ctx, opts)

			args := []string{"server", "--port", "3000"}
			if drafts {
				args = append(args, "--buildDrafts")
			}
			if host {
				args = append(args, "--bind", "0.0.0.0")
			}
			return hugo(ctx, args...)
		},
	}
	cmd.Flags().BoolVar(&drafts, "drafts", false, "include draft posts")
	cmd.Flags().BoolVar(&host, "host", false, "listen on all interfaces (LAN access)")
	return cmd
}

// hugo runs the Hugo version pinned in go.mod.
func hugo(ctx context.Context, args ...string) error {
	cmd := exec.CommandContext(ctx, "go", append([]string{"tool", "hugo"}, args...)...)
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	cmd.Cancel = func() error { return cmd.Process.Signal(os.Interrupt) }
	cmd.WaitDelay = 5 * time.Second
	if err := cmd.Run(); err != nil && ctx.Err() == nil {
		return fmt.Errorf("hugo: %w", err)
	}
	return nil
}

// watchContent regenerates data/gen whenever content/ changes, so Hugo picks
// up new reading times, devices, books… Errors are reported, not fatal.
func watchContent(ctx context.Context, opts gen.Options) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Fprintf(os.Stderr, "🚨 watch: %v\n", err)
		return
	}
	defer w.Close()
	filepath.WalkDir("content", func(path string, d os.DirEntry, err error) error {
		if err == nil && d.IsDir() {
			w.Add(path)
		}
		return nil
	})

	var timer *time.Timer
	for {
		select {
		case <-ctx.Done():
			return
		case ev := <-w.Events:
			if !strings.HasSuffix(ev.Name, ".md") {
				continue
			}
			if timer != nil {
				timer.Stop()
			}
			timer = time.AfterFunc(200*time.Millisecond, func() {
				if err := gen.Run(opts); err != nil {
					fmt.Fprintf(os.Stderr, "🚨 %v\n", err)
				}
			})
		case err := <-w.Errors:
			fmt.Fprintf(os.Stderr, "🚨 watch: %v\n", err)
		}
	}
}
