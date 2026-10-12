package images

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"
)

func TestConvertFolder(t *testing.T) {
	dir := t.TempDir()
	img := image.NewRGBA(image.Rect(0, 0, 8, 8))
	img.Set(1, 1, color.RGBA{255, 0, 0, 255})
	var buf bytes.Buffer
	png.Encode(&buf, img)
	os.WriteFile(filepath.Join(dir, "a.PNG"), buf.Bytes(), 0o644)
	os.WriteFile(filepath.Join(dir, "broken.jpg"), []byte("nope"), 0o644)
	os.WriteFile(filepath.Join(dir, "notes.txt"), []byte("x"), 0o644)

	results, err := Convert(dir, 80)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 2 {
		t.Fatalf("results = %+v", results)
	}
	for _, r := range results {
		switch filepath.Base(r.Input) {
		case "a.PNG":
			if r.Err != nil || r.Output != filepath.Join(dir, "a.webp") {
				t.Errorf("a.PNG: %+v", r)
			}
			raw, _ := os.ReadFile(r.Output)
			if !bytes.HasPrefix(raw, []byte("RIFF")) || !bytes.Contains(raw[:16], []byte("WEBP")) {
				t.Errorf("not a webp file")
			}
		case "broken.jpg":
			if r.Err == nil {
				t.Error("broken.jpg converted")
			}
		}
	}
}

func TestOutputPath(t *testing.T) {
	for in, want := range map[string]string{"a/b.jpeg": "a/b.webp", "c.JPG": "c.webp", "d.gif": "d.gif.webp"} {
		if got := OutputPath(in); got != want {
			t.Errorf("OutputPath(%s) = %s", in, got)
		}
	}
}
