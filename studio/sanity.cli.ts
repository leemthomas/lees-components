import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'bf63zuwb',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  deployment: { autoUpdates: true },
  // Hosted Studio: https://aqa-sandbox.sanity.studio (first deploy registers the hostname)
  studioHost: 'aqa-sandbox',
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
  },
})
