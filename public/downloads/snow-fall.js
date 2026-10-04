/*
MIT License

Copyright (c) 2026 Salvatore Laisa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * <snow-fall> — a dependency-free, pure-CSS-animated snowfall web component.
 *
 * The web component version of the snow on https://salvatorelaisa.blog during
 * the Christmas season. Flakes fall in three depth layers: many tiny, slow,
 * faint dots far away, a middle layer of soft dots, and a few large crystal
 * glyphs up close that fall fastest, each one swaying and tilting on its way
 * down. JavaScript only builds the flakes once; the motion is all CSS
 * transforms, so it stays cheap.
 *
 * USAGE
 *
 *   <script type="module" src="snow-fall.js"></script>
 *   <snow-fall></snow-fall>
 *
 * ATTRIBUTES
 *
 *   count      Number of flakes (default 42, capped at 300).
 *   contained  Fill the nearest positioned ancestor instead of the viewport.
 *              Give that ancestor `position: relative` (and usually
 *              `overflow: hidden`).
 *
 * CSS CUSTOM PROPERTIES (set them on the element or any ancestor)
 *
 *   --snow-color    Flake colour (default #fff).
 *   --snow-glow     Soft halo around each flake. The default is a cold
 *                   blue-grey, which keeps white flakes visible on light pages.
 *   --snow-z-index  Stacking order (default 9999, above the page). Use -1 to
 *                   let the snow fall *behind* the content instead.
 *
 *   snow-fall { --snow-color: #b9cdd8; --snow-z-index: -1; }
 *
 * The snow never intercepts clicks or taps, is hidden from assistive
 * technologies, and disappears for users who ask for reduced motion.
 */

const LAYERS = [
	// share: fraction of the flakes; fall: seconds per crossing; size: px or rem
	{ name: "far", share: 0.5, fall: [22, 34], size: [2, 3], unit: "px" },
	{ name: "mid", share: 0.35, fall: [14, 21], size: [3, 5], unit: "px" },
	{ name: "near", share: 0.15, fall: [9, 13], size: [0.8, 1.3], unit: "rem" },
];

// U+FE0E keeps the crystals as text glyphs, so they take --snow-color instead
// of being swapped for a platform emoji.
const GLYPHS = ["❄︎", "❅︎", "❆︎"];

const DEFAULT_COUNT = 42;
const MAX_COUNT = 300;

const STYLES = `
:host {
	position: fixed;
	inset: 0;
	display: block;
	overflow: hidden;
	pointer-events: none;
	z-index: var(--snow-z-index, 9999);
	contain: strict;
}

:host([contained]) {
	position: absolute;
}

:host([hidden]) {
	display: none;
}

.flake {
	position: absolute;
	top: 0;
	left: var(--x);
	/* Full height of the host, so the percentage translate below spans the whole
	   viewport (or container), not just the flake's own few pixels. */
	height: 100%;
	animation: fall var(--fall) linear var(--delay) infinite;
	will-change: transform;
}

.flake > span {
	display: block;
	animation: sway var(--sway-time) ease-in-out var(--delay) infinite alternate;
	will-change: transform;
}

.far > span,
.mid > span {
	width: var(--size);
	height: var(--size);
	border-radius: 50%;
	background-color: var(--snow-color, #fff);
	box-shadow: 0 0 4px var(--snow-glow, rgba(90, 120, 140, 0.45));
}

.far > span {
	opacity: 0.45;
}

.mid > span {
	opacity: 0.75;
}

.near > span {
	font-family: system-ui, sans-serif;
	font-size: var(--size);
	line-height: 1;
	color: var(--snow-color, #fff);
	text-shadow: 0 0 6px var(--snow-glow, rgba(90, 120, 140, 0.45));
	opacity: 0.85;
	user-select: none;
}

/* The extra rem keeps the largest crystals fully out of sight at the start,
   even in a short container. */
@keyframes fall {
	from {
		transform: translate3d(0, calc(-5% - 1.5rem), 0);
	}

	to {
		transform: translate3d(0, 105%, 0);
	}
}

@keyframes sway {
	from {
		transform: translateX(calc(var(--sway) * -1)) rotate(-25deg);
	}

	to {
		transform: translateX(var(--sway)) rotate(25deg);
	}
}

@media (prefers-reduced-motion: reduce) {
	:host {
		display: none;
	}
}
`;

const rand = (min, max) => min + Math.random() * (max - min);

const pickLayer = () => {
	let roll = Math.random();
	for (const layer of LAYERS) {
		if (roll < layer.share) return layer;
		roll -= layer.share;
	}
	return LAYERS[LAYERS.length - 1];
};

class SnowFall extends HTMLElement {
	static observedAttributes = ["count"];

	#field;

	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		const style = document.createElement("style");
		style.textContent = STYLES;
		this.#field = document.createElement("div");
		root.append(style, this.#field);
	}

	get count() {
		const value = Number.parseInt(this.getAttribute("count") ?? "", 10);
		if (Number.isNaN(value)) return DEFAULT_COUNT;
		return Math.min(Math.max(value, 0), MAX_COUNT);
	}

	set count(value) {
		this.setAttribute("count", String(value));
	}

	connectedCallback() {
		this.setAttribute("aria-hidden", "true");
		this.#render();
	}

	attributeChangedCallback() {
		if (this.isConnected) this.#render();
	}

	#render() {
		const flakes = Array.from({ length: this.count }, () => this.#flake());
		this.#field.replaceChildren(...flakes);
	}

	#flake() {
		const layer = pickLayer();
		const fall = rand(...layer.fall);

		const flake = document.createElement("div");
		flake.className = `flake ${layer.name}`;
		flake.style.setProperty("--x", `${rand(0, 100).toFixed(1)}%`);
		flake.style.setProperty("--fall", `${fall.toFixed(1)}s`);
		// A negative delay starts each flake mid-fall, so the first frame is
		// already snowing instead of waiting for the flakes to drop in.
		flake.style.setProperty("--delay", `${(-rand(0, fall)).toFixed(1)}s`);
		flake.style.setProperty("--size", `${rand(...layer.size).toFixed(2)}${layer.unit}`);
		flake.style.setProperty("--sway", `${Math.round(rand(8, 40))}px`);
		flake.style.setProperty("--sway-time", `${rand(3, 7).toFixed(1)}s`);

		const inner = document.createElement("span");
		if (layer.name === "near") {
			inner.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
		}
		flake.append(inner);
		return flake;
	}
}

if (!customElements.get("snow-fall")) {
	customElements.define("snow-fall", SnowFall);
}

export { SnowFall };
