import { readdir } from "node:fs/promises";
import { parseMarkdown } from "./_frontmatter.ts";
import { renderTable } from "./_table.ts";

interface Post {
  title: string;
  date: string;
  sortKey: number;
  tags: string;
}

interface Frontmatter {
  draft?: boolean;
  title?: string;
  date?: string | Date;
  tags?: string[];
}

function truncateTitle(title: string): string {
  const maxWords = 6;
  const words = title.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return title;
}

/** Normalizes `2020-04-3` & friends to `2020-04-03` so the column lines up. */
function normalizeDate(date: string | Date | undefined): string {
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  if (!date) return "";

  const match = String(date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return String(date);

  const [, year, month, day] = match;
  return `${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}`;
}

/** Sortable `YYYYMMDD` number; undated posts sort last. */
function dateSortKey(date: string): number {
  const digits = date.replace(/-/g, "");
  return /^\d{8}$/.test(digits) ? Number(digits) : Number.POSITIVE_INFINITY;
}

const contentDir = `${process.cwd()}/content`;

const entries = await readdir(contentDir, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name);

const fileContents = await Promise.all(
  files.map((file) => Bun.file(`${contentDir}/${file}`).text()),
);

const draftPosts: Post[] = [];

for (const fileContent of fileContents) {
  const data = parseMarkdown(fileContent).data as Frontmatter;

  if (data.draft) {
    const tags = Array.isArray(data.tags)
      ? data.tags.join(", ")
      : data.tags || "No tags";

    const date = normalizeDate(data.date);

    draftPosts.push({
      title: truncateTitle(data.title || "Untitled"),
      date: date || "No date",
      sortKey: dateSortKey(date),
      tags,
    });
  }
}

// Oldest first; undated posts land at the bottom, alphabetically by title.
draftPosts.sort((a, b) =>
  a.sortKey === b.sortKey
    ? a.title.localeCompare(b.title)
    : a.sortKey - b.sortKey
);

if (draftPosts.length === 0) {
  console.log("No draft posts found.");
} else {
  console.log(`\n📝 Draft Posts (${draftPosts.length}):\n`);
  console.log(
    renderTable(
      ["Date", "Title", "Tags"],
      draftPosts.map((post) => [post.date, post.title, post.tags]),
    ),
  );
  console.log();
}
