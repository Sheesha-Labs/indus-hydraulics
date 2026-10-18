# MannTek service documents — `manntek-service-documents`

**113 attachments (105 distinct PDFs, about 220 MB) on 17 MannTek listings**, all kind `service_manual`
and ungated. They are MannTek's operating manuals and service instructions, from manntek.se › Downloads ›
Service Downloads. Indus is an authorised MannTek distributor.

Selection: for each listing, the family operating manual plus the current service instruction for every
size of the half it sells (tank unit or hose unit). Superseded versions of the same size and half are left
out, for example the pre-2022 DGC 1" and 2" tank-unit sheets, the older DAC and DCC operating manuals and
the early-2026 PERC F-version sheets. Titles come from each PDF's own heading. Two-half families (FFBV,
swivel joints) and shared operating manuals reuse one uploaded file.

The files stay outside the repo; the folder is passed as `--doc-dir`.

```bash
# only after the document-label fix (packages/domain/src/product-documents.ts) is deployed
pnpm --filter @indus/db exec tsx src/scripts/attach-product-documents.ts \
  --payload=manntek-service-documents --doc-dir=<Service Downloads folder> --dry-run
pnpm --filter @indus/db exec tsx src/scripts/attach-product-documents.ts \
  --payload=manntek-service-documents --doc-dir=<Service Downloads folder>
```

Then purge the `products` tag and send the 17 product URLs to IndexNow, at least an hour after any deploy.

Dry run 2026-10-18: 113 to attach, 0 problems.
