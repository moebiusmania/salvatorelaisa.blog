import { createContent } from "./_compose.ts";

const frontMatter = `---
title: "{{title}}"
purchase: "{{date}}"
tags: [""]
image: ""
post: "/post/"
# url: ""
---

`;

const title = Deno.args[0];
createContent(title, "content/devices", "device", frontMatter);
