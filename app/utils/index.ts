const KEY: string = "theme";

export const LIGHT: string = "corporate";
export const DARK: string = "night";

export const isDark = (): boolean =>
	localStorage && localStorage.getItem(KEY) ? true : false;

export const toggleDark = (value: boolean): void =>
	localStorage && localStorage.setItem(KEY, value ? DARK : LIGHT);
