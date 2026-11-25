/**
 * Generates the synthetic extraction eval set (S08-T02): 12 documents with neutral content (TEST- part numbers,
 * "Sample Client LLC") and what a correct read returns. Run from apps/ops:
 *   bun evals/scripts/build-extract-fixtures.ts
 * The files and cases.json are committed (small). The golden set of real enquiries stays in the private bucket.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import sharp from 'sharp'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'synthetic', 'extract')
const FILES = join(DIR, 'files')
mkdirSync(FILES, { recursive: true })

interface Expected {
  description: string
  qty: number | null
  partNo: string | null
  /** The line must come back Unsure (a person decides). */
  unsure?: boolean
}
interface Case {
  id: string
  file: string
  subject?: string
  note: string
  expect: Expected[]
}
const cases: Case[] = []
const put = (name: string, bytes: Uint8Array | Buffer) => writeFileSync(join(FILES, name), bytes)

type Row = [string, string, string, string, string]
const ROWS: Row[] = [
  ['1', 'Ball valve 2" ANSI 300 RF', 'TEST-0101', '10', 'NOS'],
  ['2', 'Gate valve 4" class 150 flanged', 'TEST-0102', '4', 'NOS'],
  ['3', 'Spiral wound gasket 2" 300#', 'TEST-0103', '24', 'PCS'],
  ['4', 'Stud bolt 5/8" x 4" B7/2H', 'TEST-0104', '96', 'NOS'],
  ['5', 'Hydraulic hose 1/2" 2SN', 'TEST-0105', '50', 'MTR'],
  ['6', 'Pressure gauge 0-100 bar 4" dial', 'TEST-0106', '6', 'NOS'],
  ['7', 'Check valve 1" NPT stainless', 'TEST-0107', '12', 'NOS'],
  ['8', 'O-ring kit nitrile metric', 'TEST-0108', '3', 'SET'],
]
const exp = (r: Row): Expected => ({ description: r[1], qty: Number(r[3]), partNo: r[2] })

async function tablePdf(pages: Row[][], opts: { header?: string; repeatOnNext?: Row } = {}) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  pages.forEach((rows, p) => {
    const page = doc.addPage([595, 842])
    page.drawText(opts.header ?? 'Sample Client LLC · Request for Quotation SC-2201', {
      x: 40,
      y: 800,
      size: 11,
      font: bold,
    })
    page.drawText(
      p === 0 ? 'Please quote the items below. Closing date: 15 Dec 2026.' : '(continued)',
      { x: 40, y: 780, size: 10, font }
    )
    let y = 740
    page.drawText('No   Description                                   Part no.        Qty    UoM', {
      x: 40,
      y,
      size: 10,
      font: bold,
    })
    const list = p > 0 && opts.repeatOnNext ? [opts.repeatOnNext, ...rows] : rows
    for (const [no, desc, part, qty, uom] of list) {
      y -= 18
      page.drawText(no, { x: 40, y, size: 10, font })
      page.drawText(desc, { x: 70, y, size: 10, font })
      page.drawText(part, { x: 330, y, size: 10, font })
      page.drawText(qty, { x: 420, y, size: 10, font })
      page.drawText(uom, { x: 460, y, size: 10, font })
    }
  })
  return doc.save()
}

function svgPage(lines: string[], extra = '') {
  const t = lines
    .map(
      (l, i) =>
        `<text x="60" y="${140 + i * 46}" font-family="Helvetica, Arial" font-size="26" fill="#111">${l.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</text>`
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754"><rect width="100%" height="100%" fill="#fff"/><text x="60" y="80" font-family="Helvetica, Arial" font-size="30" fill="#111">Sample Client LLC · RFQ SC-2203</text>${t}${extra}</svg>`
}

async function imagePdf(svg: string) {
  const jpg = await sharp(Buffer.from(svg))
    .jpeg({ quality: 80 })
    .withMetadata({ density: 200 })
    .toBuffer()
  const doc = await PDFDocument.create()
  const img = await doc.embedJpg(jpg)
  doc.addPage([595, 842]).drawImage(img, { x: 0, y: 0, width: 595, height: 842 })
  return doc.save()
}

// 1 · a text PDF table
put('01-table.pdf', await tablePdf([ROWS.slice(0, 5)]))
cases.push({
  id: 'pdf-table',
  file: '01-table.pdf',
  note: 'One-page text PDF table',
  expect: ROWS.slice(0, 5).map(exp),
})

// 2 · a two-page table that continues
put('02-continued.pdf', await tablePdf([ROWS.slice(0, 4), ROWS.slice(4, 8)]))
cases.push({
  id: 'pdf-continued',
  file: '02-continued.pdf',
  note: 'Table running over two pages',
  expect: ROWS.map(exp),
})

// 3 · a scanned page (image only)
put(
  '03-scanned.pdf',
  await imagePdf(
    svgPage(ROWS.slice(0, 3).map((r) => `${r[0]}   ${r[1]}   ${r[2]}   ${r[3]} ${r[4]}`))
  )
)
cases.push({
  id: 'pdf-scanned',
  file: '03-scanned.pdf',
  note: 'Scanned page, no text layer',
  expect: ROWS.slice(0, 3).map(exp),
})

// 4 · a handwritten quantity change on a scan: printed 8 crossed out, 10 written beside it
{
  const svg = svgPage(
    [
      '1   Pressure gauge 0-100 bar 4" dial   TEST-0106   8 NOS',
      '2   Check valve 1" NPT stainless   TEST-0107   12 NOS',
    ],
    '<line x1="905" y1="132" x2="935" y2="112" stroke="#123" stroke-width="4"/><text x="950" y="118" font-family="Comic Sans MS, cursive" font-size="34" fill="#1a3a8a" transform="rotate(-8 950 118)">10</text>'
  )
  put(
    '04-handwritten.jpg',
    await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).withMetadata({ density: 200 }).toBuffer()
  )
  cases.push({
    id: 'image-handwritten',
    file: '04-handwritten.jpg',
    note: 'Printed 8 crossed out and 10 handwritten: must be Unsure',
    expect: [
      {
        description: 'Pressure gauge 0-100 bar 4" dial',
        qty: null,
        partNo: 'TEST-0106',
        unsure: true,
      },
      exp(ROWS[6]!),
    ],
  })
}

// 5 · the same line repeated at the top of page 2
put(
  '05-duplicate.pdf',
  await tablePdf([ROWS.slice(0, 3), ROWS.slice(3, 5)], { repeatOnNext: ROWS[2]! })
)
cases.push({
  id: 'pdf-duplicate',
  file: '05-duplicate.pdf',
  note: 'Line 3 repeated on page 2: returned once',
  expect: ROWS.slice(0, 5).map(exp),
})

// 6 · XLSX: merged title rows, header on row 4, a totals row
{
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('RFQ')
  ws.getCell('A1').value = 'Sample Client LLC'
  ws.mergeCells('A1:E1')
  ws.getCell('A2').value = 'Request for quotation SC-2206'
  ws.mergeCells('A2:E2')
  ws.getRow(4).values = ['Item', 'Description', 'Part number', 'Quantity', 'Unit']
  ROWS.slice(0, 6).forEach(
    (r, i) => (ws.getRow(5 + i).values = [Number(r[0]), r[1], r[2], Number(r[3]), r[4]])
  )
  ws.getCell('B11').value = 'Total items'
  ws.getCell('D11').value = { formula: 'SUM(D5:D10)', result: 190 }
  put('06-merged.xlsx', Buffer.from(await wb.xlsx.writeBuffer()))
  cases.push({
    id: 'xlsx-merged-totals',
    file: '06-merged.xlsx',
    note: 'Merged title, totals row ignored',
    expect: ROWS.slice(0, 6).map(exp),
  })
}

// 7 · CSV with semicolons
put(
  '07-lines.csv',
  Buffer.from(
    ['No;Description;Part no.;Qty;UoM', ...ROWS.slice(2, 7).map((r) => r.join(';'))].join('\r\n')
  )
)
cases.push({
  id: 'csv',
  file: '07-lines.csv',
  note: 'Semicolon CSV',
  expect: ROWS.slice(2, 7).map(exp),
})

// 8 · DOCX with a table
{
  const cell = (t: string) =>
    `<w:tc><w:p><w:r><w:t xml:space="preserve">${t.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</w:t></w:r></w:p></w:tc>`
  const row = (c: readonly string[]) => `<w:tr>${c.map(cell).join('')}</w:tr>`
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Sample Client LLC requests your best price and delivery for:</w:t></w:r></w:p><w:tbl>${row(['No', 'Description', 'Part no.', 'Qty', 'UoM'])}${ROWS.slice(
    0,
    4
  )
    .map((r) => row(r))
    .join(
      ''
    )}</w:tbl><w:p><w:r><w:t>Delivery to Jebel Ali. Quote valid 30 days.</w:t></w:r></w:p></w:body></w:document>`
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  )
  zip.file('word/document.xml', xml)
  put('08-table.docx', await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
  cases.push({
    id: 'docx-table',
    file: '08-table.docx',
    note: 'Word table',
    expect: ROWS.slice(0, 4).map(exp),
  })
}

// 9 · email body: a table and a free-text line
put(
  '09-body.txt',
  Buffer.from(
    [
      'Dear Sales team,',
      '',
      'Please send your quotation for the following:',
      '',
      'Item | Description | Part no. | Qty',
      '1 | Ball valve 2" ANSI 300 RF | TEST-0101 | 10 nos',
      '2 | Gate valve 4" class 150 flanged | TEST-0102 | 4 nos',
      '',
      'We also need 6 nos of pressure gauge 0-100 bar 4" dial, part TEST-0106.',
      '',
      'Best regards,',
      'Sample Buyer',
      'Sample Client LLC',
    ].join('\n')
  )
)
cases.push({
  id: 'email-table-text',
  file: '09-body.txt',
  subject: 'RFQ SC-2209',
  note: 'Table rows plus a sentence',
  expect: [exp(ROWS[0]!), exp(ROWS[1]!), exp(ROWS[5]!)],
})

// 10 · a forwarded chain: the forwarded enquiry counts, the earlier reply does not
put(
  '10-forward.txt',
  Buffer.from(
    [
      'Please address.',
      '',
      '---------- Forwarded message ---------',
      'From: Sample Buyer <buyer@sample-client.test>',
      'Date: Mon, 23 Nov 2026 at 09:12',
      'Subject: RFQ SC-2210',
      'To: <info@example.test>',
      '',
      'Dear Sir, kindly quote:',
      '1. Spiral wound gasket 2" 300# (TEST-0103) - 24 pcs',
      '2. Stud bolt 5/8" x 4" B7/2H (TEST-0104) - 96 nos',
      '',
      'On Fri, 20 Nov 2026 at 14:00, Example Sales wrote:',
      '> Thank you. For reference our last offer covered:',
      '> 1. Hydraulic hose 1/2" 2SN - 200 MTR',
    ].join('\n')
  )
)
cases.push({
  id: 'email-forward',
  file: '10-forward.txt',
  subject: 'Fwd: RFQ SC-2210',
  note: 'Forwarded enquiry; quoted reply ignored',
  expect: [exp(ROWS[2]!), exp(ROWS[3]!)],
})

// 11 · European decimals: "1,5" proves the comma, so "1.000" is one thousand
{
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Anfrage')
  ws.getRow(1).values = ['Pos', 'Description', 'Part no.', 'Qty', 'Unit']
  ws.getRow(2).values = [1, 'Hydraulic hose 1/2" 2SN', 'TEST-0105', '1.000', 'MTR']
  ws.getRow(3).values = [2, 'Hose clamp 20-32 mm', 'TEST-0109', '250', 'NOS']
  ws.getRow(4).values = [3, 'Thread sealant tape 12 mm', 'TEST-0110', '1,5', 'KG']
  put('11-european.xlsx', Buffer.from(await wb.xlsx.writeBuffer()))
  cases.push({
    id: 'xlsx-european-decimal',
    file: '11-european.xlsx',
    note: '"1.000" read as 1000 because "1,5" proves the comma',
    expect: [
      { description: 'Hydraulic hose 1/2" 2SN', qty: 1000, partNo: 'TEST-0105' },
      { description: 'Hose clamp 20-32 mm', qty: 250, partNo: 'TEST-0109' },
      { description: 'Thread sealant tape 12 mm', qty: 1.5, partNo: 'TEST-0110' },
    ],
  })
}

// 12 · "same as last order": never guessed
put(
  '12-same-as-last.txt',
  Buffer.from(
    [
      'Hello,',
      '',
      'Please quote:',
      '- Check valve 1" NPT stainless, TEST-0107, 12 nos',
      '- O-rings, same as last order',
      '',
      'Thanks',
    ].join('\n')
  )
)
cases.push({
  id: 'email-same-as-last',
  file: '12-same-as-last.txt',
  subject: 'Quote please',
  note: '"Same as last order" must be Unsure',
  expect: [
    exp(ROWS[6]!),
    { description: 'O-rings, same as last order', qty: null, partNo: null, unsure: true },
  ],
})

writeFileSync(join(DIR, 'cases.json'), `${JSON.stringify(cases, null, 2)}\n`)
console.log(`${cases.length} cases → ${DIR}`)
