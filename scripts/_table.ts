// Minimal bordered table for the CLI tools.

const pad = (text: string, width: number): string =>
	text + " ".repeat(width - Bun.stringWidth(text));

export const renderTable = (header: string[], rows: string[][]): string => {
	const widths = header.map((title, column) =>
		Math.max(...[title, ...rows.map((row) => row[column] ?? "")].map((text) => Bun.stringWidth(text))),
	);
	const line = (left: string, join: string, right: string): string =>
		left + widths.map((width) => "─".repeat(width + 2)).join(join) + right;
	const row = (cells: string[]): string =>
		`│ ${cells.map((cell, column) => pad(cell, widths[column] as number)).join(" │ ")} │`;

	return [
		line("┌", "┬", "┐"),
		row(header),
		line("├", "┼", "┤"),
		...rows.map(row),
		line("└", "┴", "┘"),
	].join("\n");
};
