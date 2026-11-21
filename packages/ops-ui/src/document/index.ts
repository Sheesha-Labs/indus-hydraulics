// Document kit (S01-T09c): the A4 page in house and Estimate layouts, and the viewer well. The model
// (DocumentData, Letterhead, safe lines) lives in @indus/ops-core; this kit only renders it.
export { default as DocumentPage, type DocumentPageProps } from './DocumentPage'
export { default as DocumentViewer, type DocumentViewerProps } from './DocumentViewer'
export { default as EstimateLayout } from './EstimateLayout'
export { default as HouseLayout, housePageLabel } from './HouseLayout'
export { default as ScaleFrame, DOC_SCALES, pageScaleClass, type DocScale } from './scale'
export { default as Stamp, type DocStamp } from './Stamp'
