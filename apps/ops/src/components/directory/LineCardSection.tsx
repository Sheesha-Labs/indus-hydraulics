import { getLineCardData } from '../../data/supplier-wizard'
import LineCardEditor from './LineCardEditor'

/** The profile's Line card tab (board 129 · board 52's editor): categories, brands, evidence and terms. */
export default async function LineCardSection({ supplierId }: { supplierId: string }) {
  const data = await getLineCardData(supplierId)
  return <LineCardEditor supplierId={supplierId} data={data} />
}
