// Command blog is the toolbox for salvatorelaisa.blog: it builds and serves the
// site (Hugo) and hosts the authoring utilities.
package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
)

func main() {
	root := &cobra.Command{
		Use:           "blog",
		Short:         "Build, serve and author salvatorelaisa.blog",
		SilenceUsage:  true,
		SilenceErrors: true,
		// Every command works from the repository root, wherever it's run from.
		PersistentPreRunE: func(*cobra.Command, []string) error { return chdirRoot() },
	}
	root.AddCommand(genCmd(), buildCmd(), serveCmd())

	if err := root.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "🚨 %v\n", err)
		os.Exit(1)
	}
}

// chdirRoot moves to the closest parent folder holding hugo.toml.
func chdirRoot() error {
	dir, err := os.Getwd()
	if err != nil {
		return err
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "hugo.toml")); err == nil {
			return os.Chdir(dir)
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return errors.New("not inside the blog repository (no hugo.toml found)")
		}
		dir = parent
	}
}
