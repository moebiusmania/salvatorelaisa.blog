# salvatorelaisa.blog

[![Build Status](https://travis-ci.org/moebiusmania/salvatorelaisa.blog.svg?branch=master)](https://travis-ci.org/moebiusmania/salvatorelaisa.blog)

Personal blog, based on [VuePress](https://vuepress.vuejs.org/) using [a port](https://github.com/alexander-heimbuch/vuepress-theme-casper) of the [Casper theme](https://github.com/TryGhost/Casper).

Blogging functionalities are developed within the `vuepress-theme-casper` package, since VuePress itself isn't specifically designed for blogs but it exposes a rich set of APIs.

The blog is hosted on [Github Pages](https://pages.github.com/) and [built by Travis CI](https://travis-ci.org/moebiusmania/salvatorelaisa.blog) each time a new commit hits the `master` branch.

### Embedded `vuepress-theme-casper`
I've hard coded the credited theme within the VuePress instance codebase since I've applied some changes tha haven't been marged yet into the main theme repository:

* compatibility with VuePress v1.0 (*alpha*)
* fixed posts chronological sorting in home page

### License
The code in this repository is released under the [MIT license](LICENSE), except where is differently specified.