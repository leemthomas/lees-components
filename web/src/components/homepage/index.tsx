import { ExamAlert, type ExamAlertBlock } from './exam-alert'
import { HelpHub, type HelpHubBlock } from './help-hub'
import { QualificationFinder, type QualificationFinderBlock } from './qualification-finder'
import { KeyDatesPanel, type KeyDatesPanelBlock } from './key-dates-panel'
import { SpotlightCarousel, type SpotlightCarouselBlock } from './spotlight-carousel'
import { PopularResources, type PopularResourcesBlock } from './popular-resources'
import { ProofBand, type ProofBandBlock } from './proof-band'
import { StudentsPanel, type StudentsPanelBlock } from './students-panel'
import { NewsletterSignup, type NewsletterSignupBlock } from './newsletter-signup'
import { HelpChat, type HelpChatBlock } from './help-chat'
import {
  AqaFooter,
  ExaminerPromo,
  FamilyServices,
  NewsResearch,
  TrainingPanel,
  type AqaFooterBlock,
  type ExaminerPromoBlock,
  type FamilyServicesBlock,
  type NewsResearchBlock,
  type TrainingPanelBlock,
} from './static-blocks'
import { MaterialSymbols } from './shared'
import './homepage.css'

/** Page builder block types from the redesigned aqa.org.uk homepage. */
export const HOMEPAGE_BLOCK_TYPES = new Set([
  'examAlert',
  'helpHub',
  'qualificationFinder',
  'keyDatesPanel',
  'spotlightCarousel',
  'popularResources',
  'proofBand',
  'trainingPanel',
  'studentsPanel',
  'familyServices',
  'examinerPromo',
  'newsResearch',
  'newsletterSignup',
  'aqaFooter',
  'helpChat',
])

type Block = { _key: string; _type: string; [field: string]: unknown }
const as = <T,>(b: Block) => b as unknown as T

export function HomepageBlock({ block }: { block: Block }) {
  let content: React.ReactNode = null
  switch (block._type) {
    case 'examAlert': content = <ExamAlert block={as<ExamAlertBlock>(block)} />; break
    case 'helpHub': content = <HelpHub block={as<HelpHubBlock>(block)} />; break
    case 'qualificationFinder': content = <QualificationFinder block={as<QualificationFinderBlock>(block)} />; break
    case 'keyDatesPanel': content = <KeyDatesPanel block={as<KeyDatesPanelBlock>(block)} />; break
    case 'spotlightCarousel': content = <SpotlightCarousel block={as<SpotlightCarouselBlock>(block)} />; break
    case 'popularResources': content = <PopularResources block={as<PopularResourcesBlock>(block)} />; break
    case 'proofBand': content = <ProofBand block={as<ProofBandBlock>(block)} />; break
    case 'trainingPanel': content = <TrainingPanel block={as<TrainingPanelBlock>(block)} />; break
    case 'studentsPanel': content = <StudentsPanel block={as<StudentsPanelBlock>(block)} />; break
    case 'familyServices': content = <FamilyServices block={as<FamilyServicesBlock>(block)} />; break
    case 'examinerPromo': content = <ExaminerPromo block={as<ExaminerPromoBlock>(block)} />; break
    case 'newsResearch': content = <NewsResearch block={as<NewsResearchBlock>(block)} />; break
    case 'newsletterSignup': content = <NewsletterSignup block={as<NewsletterSignupBlock>(block)} />; break
    case 'aqaFooter': content = <AqaFooter block={as<AqaFooterBlock>(block)} />; break
    case 'helpChat': content = <HelpChat block={as<HelpChatBlock>(block)} />; break
  }
  return (
    <>
      <MaterialSymbols />
      {content}
    </>
  )
}
