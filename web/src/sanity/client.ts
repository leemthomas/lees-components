import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, studioUrl } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // Stega powers click-to-edit in the Presentation tool. It is only switched
  // on while draft mode is enabled.
  stega: { studioUrl },
})
