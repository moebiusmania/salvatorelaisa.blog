// Admin dashboard: `deno task dashboard`.

import { fromFileUrl } from "lume/deps/path.ts";
import { createApp } from "./app.ts";
import { enterScreen, leaveScreen, readInput, write } from "./terminal.ts";

if (!Deno.stdin.isTerminal() || !Deno.stdout.isTerminal()) {
	console.error("🚨 The dashboard needs an interactive terminal.");
	Deno.exit(1);
}

// Content paths are relative to the project root, wherever this is run from.
Deno.chdir(fromFileUrl(new URL("../..", import.meta.url)));

const quit = () => {
	leaveScreen();
	Deno.exit(0);
};

// Never leave the terminal in raw mode with the mouse grabbed.
const crash = (error: unknown) => {
	leaveScreen();
	console.error("🚨 Dashboard crashed:", error);
	Deno.exit(1);
};
globalThis.addEventListener("error", (event) => {
	event.preventDefault();
	crash(event.error);
});
globalThis.addEventListener("unhandledrejection", (event) => {
	event.preventDefault();
	crash(event.reason);
});

enterScreen();

const app = createApp({ write, quit });
const syncSize = () => {
	const { columns, rows } = Deno.consoleSize();
	app.resize(columns, rows);
};
syncSize();

if (Deno.build.os === "windows") {
	setInterval(syncSize, 250);
} else {
	Deno.addSignalListener("SIGWINCH", syncSize);
	Deno.addSignalListener("SIGTERM", quit);
}

app.start();
await readInput(app.handle);
quit();
