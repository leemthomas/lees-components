import 'server-only'

// Viewer token from sanity.io/manage > API > Tokens. Needed for draft mode,
// the Presentation tool and live preview of unpublished changes.
export const token = process.env.SANITY_API_READ_TOKEN
