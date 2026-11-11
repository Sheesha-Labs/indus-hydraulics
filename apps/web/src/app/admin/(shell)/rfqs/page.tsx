import { redirect } from 'next/navigation'

/**
 * The RFQ Queue is now part of Enquiries — website RFQs, pasted tenders and
 * call-backs in one inbox. Old links and bookmarks land on the website-RFQ
 * view of it. RFQ detail pages (/admin/rfqs/<code>) are unchanged.
 */
export default function RfqQueueRedirect() {
  redirect('/admin/enquiries?source=website')
}
