// Public values only. Tokens are read in server-only modules (live.ts, token.ts).
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'bf63zuwb'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2026-10-01'
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'
