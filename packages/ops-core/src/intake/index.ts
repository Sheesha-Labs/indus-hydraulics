/**
 * Enquiry intake (S08). Pure functions only: no I/O, no database, no network.
 *
 * Lifted from the website's enquiry parsing (copied, not imported; the originals go at cutover): each module
 * encodes a parsing trap measured on a real corpus, and the tests show the failure each one prevents.
 */
export * from './normalise'
export * from './item-markers'
export * from './bid-tokens'
export * from './title-items'
export * from './paste'
export * from './spans'
export * from './email-segments'
export * from './uom'
export * from './qty'
export * from './confidence'
export * from './dates'
