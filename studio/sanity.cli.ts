import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'bf63zuwb',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  deployment: { autoUpdates: true },
  // Hosted on Vercel at https://lees-components-studio.vercel.app.
  // To use Sanity hosting instead, run `npx sanity deploy` (it asks for a hostname).
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
  },
})
