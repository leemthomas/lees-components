import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrapper empty-page">
      <h1>Page not found</h1>
      <p>Check the slug in the Studio, or go back to the <Link href="/">homepage</Link>.</p>
    </div>
  )
}
