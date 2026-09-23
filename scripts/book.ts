import { createContent } from "./_compose.ts";

// Starts as a draft: `author` is required by the schema and an empty one would
// render a blank spine label, so the book stays hidden until it's filled in.
const frontMatter = `---
title: "{{title}}"
author: ""
language: "it"
read: "{{date}}"
draft: true
# url: ""
# color: ""
# height: ""
---

`;

const title = Deno.args[0];
createContent(title, "content/books", "book", frontMatter);
