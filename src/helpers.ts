// Small presentation helpers shared by the Vento templates.

import { DARK, LIGHT, THEME_COOKIE } from "./utils/index.ts";

// Dates are rendered at build time, in UTC, so the output doesn't depend on the
// timezone of the machine running the build (CI runs in UTC).
const TZ = "UTC";

/** "7 aprile 2025" — used by the post previews. */
export const longDate = (date: Date | string): string =>
	new Date(date).toLocaleDateString("it-it", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: TZ,
	});

/** "martedì 25 ottobre 2022" — used by the post header. */
export const publishedDate = (date: Date | string): string =>
	new Date(date).toLocaleDateString("it-it", {
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "long",
		timeZone: TZ,
	});

/** ISO day, e.g. "2022-10-25", for `<time datetime>`. */
export const isoDay = (date: Date | string): string =>
	new Date(date).toISOString().slice(0, 10);

/**
 * Device purchase date: a bare year is passed through as-is, anything else goes
 * through the Italian locale ("15/03/2023").
 */
export const formatDate = (date: string): string => {
	const parts = date.split("-");
	return parts.length === 1
		? date
		: new Date(date).toLocaleDateString("it", { timeZone: TZ });
};

/** `{ "--a": "1" }` -> `--a:1;` for inline `style` attributes. */
export const cssVars = (vars: Record<string, string>): string =>
	Object.entries(vars)
		.map(([key, value]) => `${key}:${value};`)
		.join("");

// One year, in seconds, so the chosen theme sticks across visits.
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

// Inline, render-blocking script injected in <head>. It runs before the body is
// painted, so it can apply the persisted theme (or, on a first visit, the
// system preference) with no flash. It also writes the cookie on first visit.
export const themeInitScript = `(function(){try{var n=${
	JSON.stringify(THEME_COOKIE)
};var m=document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]+)"));var t=m?decodeURIComponent(m[1]):((window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?${
	JSON.stringify(DARK)
}:${
	JSON.stringify(LIGHT)
});if(!m){document.cookie=n+"="+t+"; path=/; max-age=${THEME_MAX_AGE}; samesite=lax"}var e=document.documentElement;e.setAttribute("data-theme",t);e.className=t;}catch(e){}})();`;
