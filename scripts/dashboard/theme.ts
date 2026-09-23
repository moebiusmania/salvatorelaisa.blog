// Truecolor palette for the dashboard. The accent is the blog's `--primary`
// from public/styles/themes/default.css.

export const palette = {
	bg: 0x14141c,
	surface: 0x1c1c27,
	surfaceHi: 0x262635,
	border: 0x34344a,
	borderHi: 0x4c4c6a,
	text: 0xe8e8f2,
	muted: 0x9090aa,
	faint: 0x5c5c76,
	accent: 0xf2545b,
	accentHi: 0xff7a80,
	yellow: 0xf0a202,
	green: 0x76c043,
	teal: 0x14b8c4,
	violet: 0xa98bf0,
	blue: 0x7aa2f7,
	white: 0xffffff,
} as const;

/** Mixes `color` towards `target` by `amount` (0..1). */
export const mix = (color: number, target: number, amount: number) => {
	const channel = (shift: number) => {
		const a = (color >> shift) & 0xff;
		const b = (target >> shift) & 0xff;
		return Math.round(a + (b - a) * amount) << shift;
	};
	return channel(16) | channel(8) | channel(0);
};

export const lighten = (color: number, amount: number) =>
	mix(color, 0xffffff, amount);
export const darken = (color: number, amount: number) =>
	mix(color, 0x000000, amount);
