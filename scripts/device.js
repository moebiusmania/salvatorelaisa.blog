import { createContent } from "./_compose.js";

const frontMatter = `---
title: "{{title}}"
purchase: "{{date}}"
tags: [""]
image: ""
post: "/post/"
# url: ""
---

`;

createContent(process.argv[2], "content/devices", "device", frontMatter);
