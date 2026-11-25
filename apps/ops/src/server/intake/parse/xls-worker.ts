/**
 * The worker thread's source for xls.ts (S08-T01). Plain CommonJS evaluated with `new Worker(src, { eval: true })`,
 * so no bundler has to emit a separate worker file. It loads SheetJS from the path the parent resolved, reads
 * values only (cellFormula/cellHTML off), and posts back the same grid shape the XLSX parser returns.
 */
export const XLS_WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
try {
  const XLSX = require(workerData.xlsxPath);
  // Only a real BIFF container: SheetJS would otherwise "read" any bytes as delimited text.
  const cfb = XLSX.CFB.read(workerData.bytes, { type: 'array' });
  if (!XLSX.CFB.find(cfb, 'Workbook') && !XLSX.CFB.find(cfb, 'Book')) throw new Error('not an Excel 97-2003 workbook');
  const wb = XLSX.read(workerData.bytes, { type: 'array', cellFormula: false, cellHTML: false, cellStyles: false, cellDates: true, dense: false, WTF: false });
  const letter = (n) => { let s = ''; let x = n; while (x > 0) { const m = (x - 1) % 26; s = String.fromCharCode(65 + m) + s; x = Math.floor((x - 1) / 26); } return s; };
  const display = (v) => v === null || v === undefined ? '' : v instanceof Date ? (isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)) : String(v).trim();
  const sheets = [];
  for (const [i, name] of wb.SheetNames.entries()) {
    const ws = wb.Sheets[name];
    const meta = (wb.Workbook && wb.Workbook.Sheets && wb.Workbook.Sheets[i]) || {};
    const ref = ws['!ref'];
    const rows = [];
    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      const merges = new Map();
      for (const m of ws['!merges'] || []) merges.set(XLSX.utils.encode_cell(m.s), XLSX.utils.encode_range(m));
      const hiddenRows = new Set((ws['!rows'] || []).map((r, idx) => (r && r.hidden ? idx : -1)).filter((x) => x >= 0));
      const hiddenCols = new Set((ws['!cols'] || []).map((c, idx) => (c && c.hidden ? idx : -1)).filter((x) => x >= 0));
      for (let r = range.s.r; r <= range.e.r && r < 100000; r++) {
        const cells = [];
        for (let c = range.s.c; c <= range.e.c && c < 1000; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = ws[addr];
          if (!cell) continue;
          // What the client sees: the formatted text when SheetJS has one; dates as ISO days.
          const v = cell.t === 'd' ? display(cell.v) : display(cell.w !== undefined ? cell.w : cell.v);
          if (v === '') continue;
          const out = { c: letter(c + 1), v };
          if (merges.has(addr)) out.merged = merges.get(addr);
          if (hiddenCols.has(c)) out.hidden = true;
          cells.push(out);
        }
        if (cells.length) rows.push(Object.assign({ r: r + 1, cells }, hiddenRows.has(r) ? { hidden: true } : {}));
      }
    }
    sheets.push({ name, hidden: !!meta.Hidden, rows });
  }
  parentPort.postMessage({ sheets });
} catch (e) {
  parentPort.postMessage({ error: String((e && e.message) || e) });
}
`
