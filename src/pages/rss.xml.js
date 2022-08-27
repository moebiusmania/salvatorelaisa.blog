import rss from '@astrojs/rss'
import { SITE_TITLE, SITE_DESCRIPTION } from '../config'

const postImportResult = import.meta.glob('./post/**/*.md', { eager: true })
const posts = Object.values(postImportResult)

export const get = () =>
  rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    items: posts.map((post) => {
      console.log(post)
      const frontmatter = { ...post.frontmatter, pubDate: post.frontmatter.date }
      const link = `https://www.salvatorelaisa.blog${post.url}`
      return { ...post, frontmatter, link, title: post.frontmatter.title }
    }),
    customData: `<language>it-IT</language>`,
  })
