package dashboard

import "math"

// Truecolor palette. The accent is the blog's `--primary` from
// public/styles/themes/default.css.
var palette = struct {
	bg, surface, surfaceHi, border, borderHi, text, muted, faint,
	accent, accentHi, yellow, green, teal, violet, blue, white, black Color
}{
	bg:        RGB(0x14141c),
	surface:   RGB(0x1c1c27),
	surfaceHi: RGB(0x262635),
	border:    RGB(0x34344a),
	borderHi:  RGB(0x4c4c6a),
	text:      RGB(0xe8e8f2),
	muted:     RGB(0x9090aa),
	faint:     RGB(0x5c5c76),
	accent:    RGB(0xf2545b),
	accentHi:  RGB(0xff7a80),
	yellow:    RGB(0xf0a202),
	green:     RGB(0x76c043),
	teal:      RGB(0x14b8c4),
	violet:    RGB(0xa98bf0),
	blue:      RGB(0x7aa2f7),
	white:     RGB(0xffffff),
	black:     RGB(0x000000),
}

// shadow is the drop shadow under modals.
var shadow = RGB(0x07070b)

// themeColors is the dot next to the active seasonal theme in the header.
var themeColors = map[string]Color{
	"default":   palette.accent,
	"halloween": RGB(0xff7a18),
	"spring":    palette.green,
	"summer":    RGB(0xf4a93b),
	"xmas":      RGB(0xff5a5f),
}

// mix moves color towards target by amount (0..1), channel by channel.
func mix(color, target Color, amount float64) Color {
	if color == 0 {
		return 0
	}
	a, b := color.rgb(), target.rgb()
	var out uint32
	for _, shift := range []uint{16, 8, 0} {
		ca, cb := float64(a>>shift&0xff), float64(b>>shift&0xff)
		out |= uint32(math.Floor(ca+(cb-ca)*amount+0.5)) << shift
	}
	return RGB(out)
}

func lighten(c Color, amount float64) Color { return mix(c, palette.white, amount) }
func darken(c Color, amount float64) Color  { return mix(c, palette.black, amount) }
