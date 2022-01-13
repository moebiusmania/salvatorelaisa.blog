import { PageSeo } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import fs from 'fs'
import path from 'path'

const root = process.cwd()

export async function getStaticPaths() {
  const BASE = 2010
  const CURRENT = new Date().getFullYear()
  const difference = CURRENT - BASE
  const years = Array.from(new Array(difference), (e, i) => BASE + i).map((e) => e.toString())

  return {
    paths: years.map((year) => ({
      params: {
        year,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('post')
  if (params.year == 2022) {
    console.log(allPosts)
  }

  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.date && post.date.includes(params.year)
  )

  // rss
  const rss = generateRss(filteredPosts, `year/${params.year}/index.xml`)
  const rssPath = path.join(root, 'public', 'year', params.year)
  fs.mkdirSync(rssPath, { recursive: true })
  fs.writeFileSync(path.join(rssPath, 'index.xml'), rss)

  return { props: { posts: filteredPosts, year: params.year } }
}

export default function Year({ posts, year }) {
  // Capitalize first letter and convert space to dash
  return (
    <>
      <PageSeo
        title={`${year} - ${siteMetadata.title}`}
        description={`${year} years - ${siteMetadata.title}`}
        url={`${siteMetadata.siteUrl}/year/${year}`}
      />
      <ListLayout posts={posts} title={'Ricerca per anno: ' + year} />
    </>
  )
}
