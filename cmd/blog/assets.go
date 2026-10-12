package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/cobra"

	"salvatorelaisa.blog/internal/fonts"
)

func fontsCmd() *cobra.Command {
	cmd := &cobra.Command{Use: "fonts", Short: "Self-hosted fonts"}
	cmd.AddCommand(&cobra.Command{
		Use:   "download",
		Short: "Download the families in fonts.yaml into public/fonts/",
		Args:  cobra.NoArgs,
		RunE: func(*cobra.Command, []string) error {
			cfg, err := fonts.LoadConfig("fonts.yaml")
			if err != nil {
				return err
			}
			d := fonts.Downloader{
				Client:  &http.Client{Timeout: time.Minute},
				BaseURL: "https://fonts.bunny.net",
				Dir:     filepath.Join("public", "fonts"),
				Log:     os.Stdout,
			}
			return d.Run(context.Background(), cfg)
		},
	})
	return cmd
}

// vendored are the client libraries committed under assets/js/vendor/. To
// upgrade one, change its version, file and checksum here (and the import in
// assets/js/main.ts or the htmx reference in layouts/_partials/assets/scripts.html),
// then run `blog vendor`.
var vendored = []struct {
	url, file, sha256 string
}{
	{
		url:    "https://cdn.jsdelivr.net/npm/alpinejs@3.17.4/dist/module.esm.js",
		file:   "assets/js/vendor/alpinejs-3.17.4.esm.js",
		sha256: "5e27061448975cb086f24d06efed88dc13e25b43c7c45307c503040badf4b30d",
	},
	{
		url:    "https://cdn.jsdelivr.net/npm/htmx.org@2.0.11/dist/htmx.min.js",
		file:   "assets/js/vendor/htmx-2.0.11.min.js",
		sha256: "d6fdc75f204e6bdefa99b69bf1e6d4ac69b8a364f77929f45c13476b4000f717",
	},
}

func vendorCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "vendor",
		Short: "Download the pinned Alpine.js and htmx builds into assets/js/vendor/",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			client := &http.Client{Timeout: time.Minute}
			for _, v := range vendored {
				if sum, err := fileSHA256(v.file); err == nil && sum == v.sha256 {
					fmt.Printf("✔︎ %s is up to date\n", v.file)
					continue
				}
				body, err := download(cmd.Context(), client, v.url)
				if err != nil {
					return err
				}
				if sum := sha256.Sum256(body); hex.EncodeToString(sum[:]) != v.sha256 {
					return fmt.Errorf("checksum mismatch for %s: got %x", v.url, sum)
				}
				if err := os.WriteFile(v.file, body, 0o644); err != nil {
					return err
				}
				fmt.Printf("✨ Downloaded %s\n", v.file)
			}
			return nil
		},
	}
}

func fileSHA256(file string) (string, error) {
	raw, err := os.ReadFile(file)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(raw)
	return hex.EncodeToString(sum[:]), nil
}

func download(ctx context.Context, client *http.Client, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("download failed (%d): %s", res.StatusCode, url)
	}
	return io.ReadAll(res.Body)
}
