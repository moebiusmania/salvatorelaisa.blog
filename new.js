const fs = require('fs-extra');

const param = process.argv[2];
const date = new Date().toLocaleDateString();
const dir = `./src/post/${param}/`;

const boilerplate = `---
title: ${param}
image: 
imageMeta:
  attribution:
  attributionLink:
type: post
author: salvatore
date: ${date}
publish: ${date}
tags:
  - sometag
---


<!-- more -->

`;

fs.outputFile(`${dir}/readme.md`, boilerplate);