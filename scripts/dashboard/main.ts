// Admin dashboard: `bun run dashboard`.

import { fileURLToPath } from "node:url";
import { createApp } from "./app.ts";
import { enterScreen, leaveScreen, readInput, write } from "./terminal.ts";

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	console.error("🚨 The dashboard needs an interactive terminal.");
	process.exit(1);
}

// Content paths are relative to the project root, wherever this is run from.
process.chdir(fileURLToPath(new URL("../..", import.meta.url)));

const quit = () => {
	leaveScreen();
	process.exit(0);
};

// Never leave the terminal in raw mode with the mouse grabbed.
const crash = (error: unknown) => {
	leaveScreen();
	console.error("🚨 Dashboard crashed:", error);
	process.exit(1);
};
process.on("uncaughtException", crash);
process.on("unhandledRejection", crash);

enterScreen();

const app = createApp({ write, quit });
const syncSize = () => {
	app.resize(process.stdout.columns, process.stdout.rows);
};
syncSize();

process.stdout.on("resize", syncSize);
process.on("SIGTERM", quit);

app.start();
await readInput(app.handle);
quit();
