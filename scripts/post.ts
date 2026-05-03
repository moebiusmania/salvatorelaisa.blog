import { createContent } from "./_compose.ts";

const frontMatter = `---
title: "{{title}}"
date: "{{date}}"
tags:
  - ""
draft: true
summary: ""
images: [""]
---

`;

const title = Deno.args[0];
createContent(title, "content", "post", frontMatter);
