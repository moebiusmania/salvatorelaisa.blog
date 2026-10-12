// Package images converts PNG and JPEG images to WebP (pure Go: the encoder
// runs libwebp compiled to WebAssembly, no cgo or system library needed).
package images

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"regexp"
	"sync"

	"github.com/gen2brain/webp"
)

var convertible = regexp.MustCompile(`(?i)\.(png|jpg|jpeg)$`)

// Result is the outcome of one conversion.
type Result struct {
	Input, Output string
	Err           error
}

// Convert converts a file, or every PNG/JPEG directly inside a folder (not
// recursive), next to the original with a .webp extension. Existing .webp
// files are overwritten.
func Convert(target string, quality int) ([]Result, error) {
	info, err := os.Stat(target)
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		out, err := convertFile(target, quality)
		return []Result{{Input: target, Output: out, Err: err}}, nil
	}

	entries, err := os.ReadDir(target)
	if err != nil {
		return nil, err
	}
	var inputs []string
	for _, e := range entries {
		if !e.IsDir() && convertible.MatchString(e.Name()) {
			inputs = append(inputs, filepath.Join(target, e.Name()))
		}
	}
	results := make([]Result, len(inputs))
	var wg sync.WaitGroup
	for i, in := range inputs {
		wg.Go(func() {
			out, err := convertFile(in, quality)
			results[i] = Result{Input: in, Output: out, Err: err}
		})
	}
	wg.Wait()
	return results, nil
}

// OutputPath swaps a .png/.jpg/.jpeg extension for .webp.
func OutputPath(input string) string {
	if !convertible.MatchString(input) {
		return input + ".webp"
	}
	return convertible.ReplaceAllString(input, ".webp")
}

func convertFile(input string, quality int) (string, error) {
	f, err := os.Open(input)
	if err != nil {
		return "", err
	}
	defer f.Close()
	img, _, err := image.Decode(f)
	if err != nil {
		return "", fmt.Errorf("decoding %s: %w", input, err)
	}

	output := OutputPath(input)
	tmp := output + ".tmp"
	out, err := os.Create(tmp)
	if err != nil {
		return "", err
	}
	if err := webp.Encode(out, img, webp.Options{Quality: quality}); err != nil {
		out.Close()
		os.Remove(tmp)
		return "", fmt.Errorf("encoding %s: %w", output, err)
	}
	if err := out.Close(); err != nil {
		return "", err
	}
	return output, os.Rename(tmp, output)
}

// Message is the line printed for a successful conversion.
func Message(r Result, quality int) string {
	return fmt.Sprintf("✅ %s → %s (quality: %d)", r.Input, r.Output, quality)
}
