import 'server-only'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { setActor } from '../assistant/write-tracked'
import {
  applyAnswers,
  applyFallback,
  changeAssumption,
  QuestionsError,
  type FallbackChoice,
} from './questions'

export { QuestionsError }

/**
 * A person's hand on the questions (S09-T07, board 171): "Answer manually", "Proceed with assumption", "Change"
 * and the fallback chosen from the tab. The same domain writes the Assistant's cards use, with the person as actor.
 */
type Tx = Prisma.TransactionClient
type Who = Pick<OpsUser, 'id' | 'initials'>

async function enquiryOf(tx: Tx, questionId: string): Promise<string> {
  const q = await tx.clientQuestion.findUnique({
    where: { id: questionId },
    select: { enquiryId: true },
  })
  if (!q) throw new QuestionsError('That question is no longer here')
  return q.enquiryId
}

export async function answerManually(
  tx: Tx,
  i: { questionId: string; text: string },
  user: Who
): Promise<{ open: number }> {
  await setActor(tx, { kind: 'user', id: user.id })
  const enquiryId = await enquiryOf(tx, i.questionId)
  const out = await applyAnswers(tx, {
    enquiryId,
    actor: { kind: 'user', id: user.id },
    answers: [{ questionId: i.questionId, answerText: i.text, messageId: null }],
  })
  if (!out.answered) throw new QuestionsError('This question is not waiting for an answer')
  return { open: out.open }
}

export async function proceedWithAssumption(
  tx: Tx,
  i: { questionId: string },
  user: Who
): Promise<{ applied: number }> {
  await setActor(tx, { kind: 'user', id: user.id })
  const enquiryId = await enquiryOf(tx, i.questionId)
  return applyFallback(tx, {
    enquiryId,
    choice: 'assume',
    actor: { kind: 'user', id: user.id },
    questionIds: [i.questionId],
  })
}

export async function changeAssumptionNow(
  tx: Tx,
  i: { questionId: string; text: string },
  user: Who
): Promise<{ enquiryId: string }> {
  await setActor(tx, { kind: 'user', id: user.id })
  return changeAssumption(tx, {
    questionId: i.questionId,
    text: i.text,
    actor: { kind: 'user', id: user.id },
  })
}

export async function applyFallbackNow(
  tx: Tx,
  i: { enquiryId: string; choice: FallbackChoice },
  user: Who
): Promise<{ applied: number }> {
  await setActor(tx, { kind: 'user', id: user.id })
  const out = await applyFallback(tx, {
    enquiryId: i.enquiryId,
    choice: i.choice,
    actor: { kind: 'user', id: user.id },
  })
  // A fallback card still open for these questions is settled by this choice.
  const where = { enquiryId: i.enquiryId, actionKey: 'client_question_fallback' }
  // later has no edge to cancelled: back to proposed first.
  await tx.assistantAction.updateMany({
    where: { ...where, state: 'later' },
    data: { state: 'proposed' },
  })
  await tx.assistantAction.updateMany({
    where: { ...where, state: 'proposed' },
    data: {
      state: 'cancelled',
      staleReason: `Chosen on the Questions tab: ${i.choice.replace('_', ' ')}`,
    },
  })
  return out
}
