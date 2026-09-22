// markdown-it block rule for the MDC-style timeline used in a couple of posts:
//
//   ::timeline{items="2013 - first, 2015 - second"}
//   ::
//
// It renders the same markup the old `Timeline.server.vue` component produced,
// so `_components/content/Timeline.css` keeps working unchanged.

// deno-lint-ignore-file no-explicit-any

const OPEN = /^::timeline\{(.*)\}\s*$/;
const CLOSE = /^::\s*$/;

const escape = (value: string): string =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const parseAttrs = (source: string): Record<string, string> => {
	const attrs: Record<string, string> = {};
	for (const match of source.matchAll(/(\w+)="([^"]*)"/g)) {
		attrs[match[1] as string] = match[2] as string;
	}
	return attrs;
};

export const renderTimeline = (attrs: Record<string, string>): string => {
	const title = attrs.title ?? "Timeline degli eventi";
	const description = attrs.description ??
		"Alcuni eventi che ho vissuto relativi all'articolo visualizzati in ordine cronologico";
	const list = (attrs.items ?? "").split(",").filter((item) => item.trim());

	const items = list
		.map((item, index) => {
			const text = escape(item.trim());
			return `<li class="timeline-item" role="listitem" tabindex="0" aria-label="Timeline item ${
				index + 1
			} of ${list.length}: ${text}"><div class="timeline-content"><span class="timeline-text">${text}</span></div></li>`;
		})
		.join("");

	return `<section class="timeline-container" role="region" aria-label="${escape(title)}"${
		description ? ' aria-describedby="timeline-description"' : ""
	}><ul class="timeline" role="list" aria-label="${list.length} timeline items">${items}</ul><div class="sr-only" aria-live="polite" aria-atomic="true">Timeline with ${list.length} items loaded</div></section>\n`;
};

export default function timeline(md: any): void {
	md.block.ruler.before(
		"paragraph",
		"timeline",
		(state: any, startLine: number, endLine: number, silent: boolean) => {
			const start = state.bMarks[startLine] + state.tShift[startLine];
			const line = state.src.slice(start, state.eMarks[startLine]);
			const open = line.match(OPEN);
			if (!open) return false;
			if (silent) return true;

			// Consume everything up to (and including) the closing `::`.
			let next = startLine + 1;
			while (next < endLine) {
				const from = state.bMarks[next] + state.tShift[next];
				if (CLOSE.test(state.src.slice(from, state.eMarks[next]))) {
					next++;
					break;
				}
				next++;
			}

			const token = state.push("html_block", "", 0);
			token.content = renderTimeline(parseAttrs(open[1]));
			token.map = [startLine, next];
			state.line = next;
			return true;
		},
	);
}
