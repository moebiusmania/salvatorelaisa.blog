import fs from 'fs'
import { globby } from 'globby'
import prettier from 'prettier'
import siteMetadata from '../data/siteMetadata.json' assert { type: 'json' }
import prettierConfig from '../.prettierrc.json' assert { type: 'json' }

const pages = await globby([
  'pages/*.js',
  'data/**/*.mdx',
  'data/**/*.md',
  'public/tags/**/*.xml',
  '!pages/_*.js',
  '!pages/api',
])

const sitemap = `
      <?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${pages
            .map((page) => {
              const path = page
                .replace('pages/', '/')
                .replace('data/post', '/post')
                .replace('public/', '/')
                .replace('.js', '')
                .replace('.mdx', '')
                .replace('.md', '')
                .replace('/index.xml', '')
              const route = path === '/index' ? '' : path
              if (page === `pages/404.js` || page === `pages/post/[...slug].js`) {
                return
              }
              return `
                      <url>
                          <loc>${siteMetadata.siteUrl}${route}</loc>
                      </url>
                  `
            })
            .join('')}
      </urlset>
  `

const formatted = prettier.format(sitemap, {
  ...prettierConfig,
  parser: 'html',
})

// eslint-disable-next-line no-sync
fs.writeFileSync('public/sitemap.xml', formatted)
