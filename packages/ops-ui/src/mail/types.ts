// Mail kit word types (05-map-frontend §3.10). Added by S01-T04 because the tone maps in status.ts key on
// them; the Mail kit's props (ThreadRowProps and the rest) join this file when that kit is built.

export type MailRole = 'Supplier' | 'Client' | 'Internal' | 'Unknown'

export type MailType =
  | 'Supplier quote'
  | 'Client reply'
  | 'New enquiry'
  | 'Supplier question'
  | 'Client PO'
  | 'Supplier documents'
  | 'Freight'
  | 'Payments'
  | 'Unsure'
  | 'Bounce'
  | 'Phishing'
