import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/live'
import { PAGE_QUERY, PAGE_SEO_QUERY } from '@/sanity/queries'
import { PageBuilder } from '@/components/page-builder'

type Props = { params: Promise<{ slug?: string[] }> }

const toSlug = (parts?: string[]) => (parts?.length ? parts.join('/') : 'home')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = toSlug((await params).slug)
  const { data } = await sanityFetch({ query: PAGE_SEO_QUERY, params: { slug }, stega: false })
  if (!data) return {}
  return {
    title: slug === 'home' ? { absolute: data.seo?.metaTitle || "Lee's Components" } : data.seo?.metaTitle || data.title,
    description: data.seo?.metaDescription,
  }
}

export default async function Page({ params }: Props) {
  const slug = toSlug((await params).slug)
  const { data: page } = await sanityFetch({ query: PAGE_QUERY, params: { slug } })
  if (!page) notFound()
  return <PageBuilder sections={page.sections} />
}
