import readingTime from "reading-time";

type RawContent = <T>() => string;

const KEY: string = "theme";

export const LIGHT: string = "corporate";
export const DARK: string = "halloween";

export const isDark = (): boolean => (localStorage.getItem(KEY) ? true : false);

export const toggleDark = (value: boolean): void =>
  localStorage.setItem(KEY, value ? DARK : LIGHT);

export const reading = (rawContent: RawContent): string =>
  Math.ceil(readingTime(rawContent()).minutes) + " minuti";
