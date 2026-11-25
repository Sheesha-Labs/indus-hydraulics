/**
 * Generates the intake parser fixtures (S08-T01). Neutral content only: "Sample Client LLC", part numbers
 * TEST-0001…, no real names. Run: bun src/server/intake/parse/__fixtures__/build-fixtures.ts (from apps/ops).
 * The generated files are committed (small); re-run after changing this script.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { PDFDocument, PDFName, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'
import * as XLSX from 'xlsx'

const DIR = dirname(fileURLToPath(import.meta.url))
const out = (name: string, bytes: Uint8Array | Buffer) => {
  writeFileSync(join(DIR, name), bytes)
  console.log(`${name}\t${bytes.length} bytes`)
}

export const LINES = [
  ['1', 'Ball valve 2" ANSI 300 RF', 'TEST-0001', '10', 'NOS'],
  ['2', 'Gate valve 4" class 150', 'TEST-0002', '4', 'NOS'],
  ['3', 'Spiral wound gasket 2" 300#', 'TEST-0003', '24', 'PCS'],
  ['4', 'Stud bolt 5/8" x 4" B7/2H', 'TEST-0004', '96', 'NOS'],
  ['5', 'Hydraulic hose 1/2" 2SN', 'TEST-0005', '50', 'MTR'],
  ['6', 'Pressure gauge 0-100 bar 4"', 'TEST-0006', '6', 'NOS'],
] as const

async function textPdf() {
  const doc = await PDFDocument.create()
  doc.setTitle('RFQ SC-1182')
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  for (let p = 0; p < 3; p++) {
    const page = doc.addPage([595, 842])
    page.drawText(`Sample Client LLC · Request for Quotation SC-1182 · page ${p + 1}`, {
      x: 40,
      y: 800,
      size: 11,
      font: bold,
    })
    if (p === 0)
      page.drawText('Closing date: 28 Sep 2026. Delivery: CFR Jebel Ali.', {
        x: 40,
        y: 780,
        size: 10,
        font,
      })
    let y = 740
    page.drawText('No  Description                         Part no.     Qty   UoM', {
      x: 40,
      y,
      size: 10,
      font: bold,
    })
    for (const [no, desc, part, qty, uom] of LINES.slice(p * 2, p * 2 + 2)) {
      y -= 18
      page.drawText(no, { x: 40, y, size: 10, font })
      page.drawText(desc, { x: 70, y, size: 10, font })
      page.drawText(part, { x: 330, y, size: 10, font })
      page.drawText(qty, { x: 420, y, size: 10, font })
      page.drawText(uom, { x: 460, y, size: 10, font })
    }
  }
  return doc.save()
}

async function encryptedPdf() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  doc.addPage([595, 842]).drawText('Confidential RFQ', { x: 40, y: 800, size: 12, font })
  // A Standard security handler entry in the trailer is what readers treat as "encrypted".
  const enc = doc.context.obj({
    Filter: PDFName.of('Standard'),
    V: 2,
    R: 3,
    Length: 128,
    P: -3904,
  })
  doc.context.trailerInfo.Encrypt = doc.context.register(enc)
  return doc.save()
}

async function scanJpeg(density: number, width: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.round(width * Math.SQRT2)}">
    <rect width="100%" height="100%" fill="white"/>
    <text x="40" y="80" font-family="Helvetica" font-size="28" fill="black">Sample Client LLC RFQ</text>
    <text x="40" y="140" font-family="Helvetica" font-size="24" fill="black">1  Ball valve 2in  TEST-0001  10 NOS</text>
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 60 }).withMetadata({ density }).toBuffer()
}

async function scannedPdf() {
  const doc = await PDFDocument.create()
  const img = await doc.embedJpg(await scanJpeg(150, 620))
  const page = doc.addPage([595, 842])
  page.drawImage(img, { x: 0, y: 0, width: 595, height: 842 })
  return doc.save()
}

async function workbook() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('RFQ')
  ws.getCell('A1').value = 'Sample Client LLC'
  ws.mergeCells('A1:F1')
  ws.getCell('A2').value = 'Request for quotation SC-1182'
  ws.mergeCells('A2:F2')
  ws.getCell('A3').value = 'Closing 28 Sep 2026'
  ws.mergeCells('A3:F3')
  ws.getRow(4).values = ['No', 'Description', 'Part no.', 'Internal code', 'Qty', 'UoM']
  LINES.forEach(([no, desc, part, qty, uom], i) => {
    ws.getRow(5 + i).values = [Number(no), desc, part, `IC-${900 + i}`, Number(qty), uom]
  })
  ws.getColumn(4).hidden = true
  ws.getCell('E11').value = { formula: 'SUM(E5:E10)', result: 190 }
  ws.getCell('B11').value = 'Total'
  const hidden = wb.addWorksheet('Notes', { state: 'hidden' })
  hidden.getCell('A1').value = 'Internal'
  return Buffer.from(await wb.xlsx.writeBuffer())
}

/** Board 35's shape (S08-T05): merged title rows 1–2, header row 4, twelve lines, a blank, a totals row; two more sheets. */
const SPARES = [
  ['Hydraulic hose 1/2" 2SN, 3 m, JIC F/F', 'TEST-08-2SN-3000', 24, 'NOS', ''],
  ['Hydraulic hose 3/4" 4SH, 2 m', 'TEST-12-4SH-2000', 12, 'NOS', ''],
  ['Adaptor JIC 1/2" M x BSP 1/2" M', 'TEST-ADP-JB-08', 60, 'PCS', ''],
  ['Ball valve 1" 3-pc, 5000 psi', 'TEST-BV-16-3P', 8, 'NOS', 'As per sample'],
  ['Quick coupling ISO-A 1/2"', 'TEST-QC-ISOA-08', 30, 'PAIR', ''],
  ['Filter element 10 um', 'TEST-HF-10-220', 18, 'NOS', 'Urgent'],
  ['Inline check valve 3/8"', 'TEST-CV-06-IL', 16, 'NOS', ''],
  ['Pressure gauge 0-400 bar', 'TEST-PG-400-G', 10, 'NOS', ''],
  ['Hose clamp, twin bolt, 1/2"', 'TEST-HC-TB-08', 40, 'PCS', ''],
  ['O-ring kit NBR, metric', 'TEST-OR-KIT-NBR', 2, 'SET', ''],
  ['Hydraulic oil ISO VG 46', 'TEST-OIL-VG46-20', 6, 'DRUM', '20 L drums'],
  ['Gear pump 16 cc/rev', '', 2, 'NOS', 'P/N to follow'],
] as const

async function sparesWorkbook() {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Spares list')
  ws.getCell('A1').value = 'SAMPLE VESSEL — HYDRAULIC REFIT SPARES (Q4 2026)'
  ws.mergeCells('A1:F1')
  ws.getCell('A2').value = 'Sample Client LLC · Ref SC-RFQ-0921 · Rev A'
  ws.mergeCells('A2:F2')
  ws.getRow(4).values = ['S/N', 'Description', 'Maker P/N', 'Qty', 'Unit', 'Remarks']
  SPARES.forEach(([desc, part, qty, unit, note], i) => {
    ws.getRow(5 + i).values = [i + 1, desc, part || null, qty, unit, note || null]
  })
  ws.getCell('B18').value = 'TOTAL ITEMS'
  ws.getCell('D18').value = { formula: 'SUBTOTAL(3,B5:B16)', result: 12 }
  const cons = wb.addWorksheet('Consumables')
  cons.getRow(1).values = ['S/N', 'Description', 'Qty', 'Unit']
  for (let i = 0; i < 8; i++)
    cons.getRow(2 + i).values = [i + 1, `Consumable item ${i + 1}`, 5 + i, 'PCS']
  const rev = wb.addWorksheet('Rev history')
  rev.getCell('A1').value = 'Rev A · first issue'
  return Buffer.from(await wb.xlsx.writeBuffer())
}

function xlsBiff() {
  const rows = [
    ['No', 'Description', 'Part no.', 'Qty', 'UoM'],
    ...LINES.map(([n, d, p, q, u]) => [Number(n), d, p, Number(q), u]),
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1')
  return XLSX.write(wb, { type: 'buffer', bookType: 'biff8' }) as Buffer
}

function csv() {
  const rows = [
    'No;Description;Part no.;Qty;UoM',
    ...LINES.map(([n, d, p, q, u]) => `${n};${d};${p};${q};${u}`),
    '7;Flange 2" WN 300#;TEST-0007;1.000;NOS',
  ]
  return Buffer.from(rows.join('\r\n'), 'utf8')
}

async function docx() {
  const cell = (t: string) =>
    `<w:tc><w:p><w:r><w:t xml:space="preserve">${t.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</w:t></w:r></w:p></w:tc>`
  const row = (cells: readonly string[]) => `<w:tr>${cells.map(cell).join('')}</w:tr>`
  const body = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:t>Sample Client LLC requests a quotation for the items below.</w:t></w:r></w:p>
<w:tbl>${row(['No', 'Description', 'Part no.', 'Qty', 'UoM'])}${LINES.slice(0, 3)
    .map((l) => row([l[0], l[1], l[2], l[3], l[4]]))
    .join('')}</w:tbl>
<w:p><w:r><w:t>Delivery required by 30 Oct 2026.</w:t></w:r></w:p>
</w:body></w:document>`
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
  )
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  )
  zip.file('word/document.xml', body)
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

async function bomb() {
  const zip = new JSZip()
  zip.file('payload.txt', Buffer.alloc(4 * 1024 * 1024, 0))
  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  })
}

async function pair() {
  const zip = new JSZip()
  zip.file('lines.csv', csv())
  zip.file('__MACOSX/._lines.csv', 'x')
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

out('rfq-3-pages.pdf', await textPdf())
out('encrypted.pdf', await encryptedPdf())
out('scanned.pdf', await scannedPdf())
out('rfq.xlsx', await workbook())
out('spares.xlsx', await sparesWorkbook())
out('rfq.xls', xlsBiff())
out('semicolons.csv', csv())
out('table.docx', await docx())
out('scan-96dpi.jpg', await scanJpeg(96, 500))
out('bomb.zip', await bomb())
out('two-files.zip', await pair())
