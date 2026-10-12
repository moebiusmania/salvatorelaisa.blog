package main

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/spf13/cobra"

	"salvatorelaisa.blog/internal/drafts"
	"salvatorelaisa.blog/internal/images"
	"salvatorelaisa.blog/internal/scaffold"
	"salvatorelaisa.blog/internal/stats"
	"salvatorelaisa.blog/internal/todo"
)

func newCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "new",
		Short: "Scaffold a new post, device card or book",
	}
	for _, kind := range []scaffold.Kind{scaffold.Post, scaffold.Device, scaffold.Book} {
		cmd.AddCommand(&cobra.Command{
			Use:   kind.Name + " <title>",
			Short: fmt.Sprintf("Create %s/<slug>.md", kind.Folder),
			Args:  cobra.MaximumNArgs(1),
			RunE: func(_ *cobra.Command, args []string) error {
				title := ""
				if len(args) > 0 {
					title = args[0]
				}
				path, err := kind.Create(".", title, time.Now())
				switch {
				case errors.Is(err, scaffold.ErrNoTitle):
					return message(fmt.Sprintf("⚠️ Please provide a %s title", kind.Name))
				case err != nil:
					return fmt.Errorf("Failed to create %s: %w", kind.Name, err)
				}
				fmt.Println(kind.Message(path))
				return nil
			},
		})
	}
	return cmd
}

func draftsCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "drafts",
		Short: "List draft posts",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			list, err := drafts.List("content")
			if err != nil {
				return err
			}
			fmt.Print(drafts.Render(list))
			return nil
		},
	}
}

func statsCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "stats",
		Short: "Quick blog stats",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			q, err := stats.Count(".")
			if err != nil {
				return fmt.Errorf("Error reading content directory: %w", err)
			}
			fmt.Print(q.Render())
			return nil
		},
	}
}

func webpCmd() *cobra.Command {
	var quality int
	cmd := &cobra.Command{
		Use:   "webp <file|folder>",
		Short: "Convert PNG/JPEG images to WebP (a folder: its direct children)",
		Args:  cobra.ExactArgs(1),
		RunE: func(_ *cobra.Command, args []string) error {
			if quality < 0 || quality > 100 {
				return fmt.Errorf("quality must be between 0 and 100")
			}
			results, err := images.Convert(args[0], quality)
			if err != nil {
				return err
			}
			failed := false
			for _, r := range results {
				if r.Err != nil {
					fmt.Fprintf(os.Stderr, "🚨 Failed to convert %s: %v\n", r.Input, r.Err)
					failed = true
					continue
				}
				fmt.Println(images.Message(r, quality))
			}
			if failed {
				return errors.New("some images were not converted")
			}
			return nil
		},
	}
	cmd.Flags().IntVar(&quality, "quality", 90, "WebP quality, 0-100")
	return cmd
}

func todoCmd() *cobra.Command {
	list := todo.List{Path: "todo.md", Template: "todo.template.md"}
	print := func(msg string, err error) error {
		if err == nil {
			fmt.Println(msg)
		}
		return err
	}
	index := func(arg string) (int, error) {
		n, err := strconv.Atoi(arg)
		if err != nil {
			return 0, fmt.Errorf("invalid index %q", arg)
		}
		return n, nil
	}

	cmd := &cobra.Command{Use: "todo", Short: "Manage the personal todo.md checklist"}
	cmd.AddCommand(
		&cobra.Command{Use: "init", Short: "Initialize todo.md from todo.template.md", Args: cobra.NoArgs,
			RunE: func(*cobra.Command, []string) error { return print(list.Init(), nil) }},
		&cobra.Command{Use: "list", Short: "List all tasks", Args: cobra.NoArgs,
			RunE: func(*cobra.Command, []string) error { return print(list.Show(), nil) }},
		&cobra.Command{Use: "add <task>", Short: "Add a new task", Args: cobra.ExactArgs(1),
			RunE: func(_ *cobra.Command, args []string) error { return print(list.Add(args[0])) }},
		&cobra.Command{Use: "remove <index>", Short: "Remove a task by index", Args: cobra.ExactArgs(1),
			RunE: func(_ *cobra.Command, args []string) error {
				n, err := index(args[0])
				if err != nil {
					return err
				}
				return print(list.Remove(n))
			}},
		&cobra.Command{Use: "done <index>", Short: "Mark a task as done", Args: cobra.ExactArgs(1),
			RunE: func(_ *cobra.Command, args []string) error {
				n, err := index(args[0])
				if err != nil {
					return err
				}
				return print(list.Done(n))
			}},
	)
	return cmd
}
