import { RecordNotImported } from '../../../components/route/NotFoundState'

/** Board 211 "not imported" state for this segment (05 §6.4). */
export default function SuppliersNotFound() {
  return <RecordNotImported kind="supplier" />
}
