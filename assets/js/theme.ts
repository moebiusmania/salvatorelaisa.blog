// Theme persistence is cookie based so the inline script in <head>
// (layouts/_partials/head/theme-init.js) can apply it before the first paint.

export const THEME_COOKIE = "theme";
export const LIGHT = "light";
export const DARK = "dark";

export type Theme = typeof LIGHT | typeof DARK;

// One year, in seconds, so the chosen theme sticks across visits.
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;
