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

const title = process.argv[2];
createContent(title, "content", "post", frontMatter);
