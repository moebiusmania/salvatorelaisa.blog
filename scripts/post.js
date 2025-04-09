import { createContent } from "./_compose.js";

const frontMatter = `---
title: "{{title}}"
date: "{{date}}"
tags:
  - ""
draft: true
summary: ""
images: ""
---

`;

createContent(process.argv[2], "content", "post", frontMatter);
