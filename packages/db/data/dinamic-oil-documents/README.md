# Dinamic Oil documents — `dinamic-oil-documents`

28 attachments on the 14 Wave 1 listings: the series catalogue (kind `datasheet`) and the
use-and-maintenance manual (kind `service_manual`). Five distinct PDFs, uploaded once each to
`product-documents/dinamic-oil/`. Attached 2026-10-20 (listings still drafts).

```bash
pnpm --filter @indus/db exec tsx src/scripts/attach-product-documents.ts \
  --payload=dinamic-oil-documents --doc-dir=<export>/dinamicoil-downloads
```

The PDFs live in the Dinamic Oil export folder (`dinamicoil-downloads/`), never in the repo.
