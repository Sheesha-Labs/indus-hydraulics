import { RecordNotImported } from '../../../../../components/route/NotFoundState'

/** Board 211 "not imported" state for this segment (05 §6.4). */
export default function MailFolderThreadIdNotFound() {
  return <RecordNotImported kind="thread" />
}
