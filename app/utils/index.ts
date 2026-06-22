// Theme persistence is cookie based (instead of localStorage) so the theme is
// available to the server during SSR. This lets the very first painted HTML
// already carry the correct `data-theme`/class, avoiding the flash of light
// content when a dark theme is selected and the page is refreshed.

export const THEME_COOKIE: string = "theme";

export const LIGHT = "light";
export const DARK = "dark";

export type Theme = typeof LIGHT | typeof DARK;

// Whether the user's operating system / browser requests a dark color scheme.
// Used on the very first visit (no cookie yet) to pick a sensible default
// instead of always falling back to the light theme.
export const prefersDark = (): boolean =>
	typeof window !== "undefined" &&
	typeof window.matchMedia === "function" &&
	window.matchMedia("(prefers-color-scheme: dark)").matches;
