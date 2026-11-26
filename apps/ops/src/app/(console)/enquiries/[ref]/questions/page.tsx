import { EmptyState } from '@indus/ops-ui/states'
import AddQuestionSheet from '../../../../../components/enquiry/questions/AddQuestionSheet'
import ClientQuestionList from '../../../../../components/enquiry/questions/ClientQuestionList'
import FallbackChooser from '../../../../../components/enquiry/questions/FallbackChooser'
import QuestionClock from '../../../../../components/enquiry/questions/QuestionClock'
import ReviewCardClient from '../../../../../components/review/ReviewCardClient'
import Arrives from '../../../../../components/skeleton/Arrives'
import { getQuestionsTab } from '../../../../../data/enquiry-questions'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../../lib/route-params'

/**
 * Board 171 · Questions tab (T2; S09-T07): the client section — questions on the held lines, the Assistant's clock,
 * the fallback, and the cards waiting on them (questions to approve, the day-2 reminder, the client's answers, the
 * fallback) drawn as Review draws them. Questions from suppliers arrive with S14 (board 64).
 */
export default async function EnquiriesRefQuestionsPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  const user = await requireOpsUser().catch(signInFor(`/enquiries/${ref}/questions`))
  routeParam(enquiryRef, ref)
  const t = await getQuestionsTab(ref, user)
  if (!t)
    return (
      <EmptyState
        title="This enquiry has no questions on record"
        text="The sample record in this environment has no database row."
        align="left"
      />
    )
  const open = t.questions.filter((q) => q.status === 'sent').length
  const reviewHref = (r: string, edit = false) => `/review?card=${r}${edit ? '&edit=1' : ''}`
  return (
    <div
      data-built="enquiry-questions"
      className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-4"
    >
      <div className="flex min-w-0 flex-col gap-4">
        {t.questions.length ? (
          <ClientQuestionList
            enquiryRef={t.ref}
            clientName={t.clientName}
            sentLine={t.sentLine}
            questions={t.questions}
          />
        ) : (
          <EmptyState
            title="No questions to the client"
            text="When a line cannot be sourced until the client answers (trim, scope, connection), ask here: only those lines wait, the rest go to suppliers."
            align="left"
          />
        )}
        {t.cards.map((card) => (
          <ReviewCardClient
            key={card.id}
            card={card}
            editing={false}
            editHref={reviewHref(card.ref, true)}
            closeEditHref={`/enquiries/${t.ref}/questions`}
            conflictHref={reviewHref(card.ref)}
            locked={false}
          />
        ))}
        <section aria-label="Questions from suppliers">
          <Arrives
            sprint="S14"
            what="Board 64: questions from suppliers, relayed to the client without their names."
          />
        </section>
      </div>
      <div className="flex flex-col gap-4">
        {t.round ? <QuestionClock round={t.round} /> : null}
        {t.fallback && open ? (
          <FallbackChooser
            enquiryId={t.id}
            enquiryRef={t.ref}
            dateLabel={t.fallback.dateLabel}
            open={open}
            linesOther={t.fallback.quoteLines}
            missingAssumption={t.fallback.missingAssumption}
          />
        ) : null}
      </div>
      <AddQuestionSheet enquiryId={t.id} enquiryRef={t.ref} lines={t.askable} />
    </div>
  )
}
