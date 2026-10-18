'use client'

import { useIsPresentationTool } from 'next-sanity/hooks'

/** Shown in draft mode outside the Studio, so reviewers can leave preview. */
export function DisableDraftMode() {
  const inPresentation = useIsPresentationTool()
  if (inPresentation !== false) return null
  return (
    <a href="/api/draft-mode/disable" className="draft-banner">
      Previewing drafts. Exit preview
    </a>
  )
}
