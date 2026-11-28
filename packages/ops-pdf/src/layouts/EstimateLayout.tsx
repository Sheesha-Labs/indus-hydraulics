import {
  documentNumber,
  estimatePageLabel,
  revisionLabel,
  type DocPage,
  type EstimateDocument,
  type Letterhead,
} from '@indus/ops-core'
import { Page, Text, View } from '@react-pdf/renderer'
import { SANS } from '../fonts'
import {
  C,
  Cell,
  columnWidths,
  f,
  Footer,
  Img,
  px,
  rowWidths,
  RunningHeader,
  Watermark,
  type PdfAssets,
} from '../parts'

/**
 * The client quotation in the Zoho Estimate look (ADR-14, board 156), one page of paginate() at a time, drawn
 * with the HTML EstimateLayout's own sizes, leading (1.45 base) and spacing: logo and company block with the
 * TRN, "QUOTATION" and "# number" (a revision prints "-R2"), bill-to and meta, the line table, totals box,
 * notes, the signature and stamp strip, and "Page n of N". Continuation pages carry a running header.
 */
const LH = 1.45

export default function EstimateLayout({
  page,
  letterhead,
  assets,
  draft,
}: {
  /** One page of paginate(): its slice of the document and its position. */
  page: DocPage<EstimateDocument>
  letterhead: Letterhead
  assets: PdfAssets
  draft?: boolean
}) {
  const data = page.data
  const no = documentNumber(data.no, data.revision)
  const rev = revisionLabel(data.revision)
  const desc = data.items.descCol ?? 1
  const widths = columnWidths(data.items.cols, desc)
  const align = (i: number) => (i === 0 || i === desc ? 'left' : 'right')
  const ink = { color: C['io-est-ink'] }
  return (
    <Page
      size={data.page?.size === 'Letter' ? 'LETTER' : 'A4'}
      style={{
        fontFamily: SANS,
        paddingTop: px(44),
        paddingHorizontal: px(48),
        paddingBottom: px(64),
      }}
    >
      {draft ? <Watermark /> : null}
      <Footer
        left={`${letterhead.legalName} · ${no}`}
        label={estimatePageLabel(page.page, page.pageCount)}
        size={10}
        bottom={18}
      />
      {page.first ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              {assets.logo ? <Img image={assets.logo} height={58} /> : null}
              <View style={{ marginTop: px(6) }}>
                <Text style={{ ...f(13, 1.6), fontWeight: 600, color: C['io-est-strong'] }}>
                  {letterhead.legalName}
                </Text>
                {letterhead.addressLines.map((line, i) => (
                  <Text key={line} style={{ ...f(10.5, 1.6), color: C['io-est-co'] }}>
                    {line}
                    {i === letterhead.addressLines.length - 1 ? ` · TRN ${letterhead.trn}` : ''}
                  </Text>
                ))}
                <Text style={{ ...f(10.5, 1.6), color: C['io-est-co'] }}>
                  {letterhead.mailbox} · {letterhead.phone}
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={{
                  ...f(30, LH),
                  ...ink,
                  fontWeight: 500,
                  textAlign: 'right',
                  letterSpacing: px(0.6),
                }}
              >
                {data.title}
              </Text>
              <Text style={{ ...f(12, LH), ...ink, textAlign: 'right', marginTop: px(2) }}>
                # {no}
              </Text>
            </View>
          </View>

          {rev ? (
            <View
              style={{
                marginTop: px(10),
                backgroundColor: C['io-est-rev'],
                paddingVertical: px(6),
                paddingHorizontal: px(10),
              }}
            >
              <Text style={{ ...f(11, LH), ...ink }}>{rev}</Text>
            </View>
          ) : null}

          <View
            style={{ marginTop: px(22), flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ width: '50%' }}>
              <Text style={{ ...f(11.5, LH), color: C['io-est-meta'] }}>{data.billTo.label}</Text>
              <Text style={{ ...f(11.5, LH), ...ink, fontWeight: 600 }}>{data.billTo.name}</Text>
              {data.billTo.lines.map((l) => (
                <Text key={l} style={{ ...f(11.5, LH), ...ink }}>
                  {l}
                </Text>
              ))}
            </View>
            <View>
              {data.meta.map((m) => (
                <View
                  key={m.label}
                  style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: px(3) }}
                >
                  <Text style={{ ...f(11.5, LH), color: C['io-est-meta'], marginRight: px(16) }}>
                    {m.label}
                  </Text>
                  <Text style={{ ...f(11.5, LH), ...ink, textAlign: 'right' }}>{m.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <RunningHeader text={`${data.title} # ${no}`} />
      )}

      {data.items.rows.length ? (
        <View style={{ marginTop: px(page.first ? 18 : 0) }}>
          <View style={{ flexDirection: 'row', backgroundColor: C['io-navy'] }}>
            {data.items.cols.map((h, i) => (
              <View
                key={h}
                style={{ width: `${widths[i]}%`, paddingVertical: px(7), paddingHorizontal: px(8) }}
              >
                <Text
                  style={{
                    ...f(10.5, LH),
                    fontWeight: 500,
                    color: C['io-card'],
                    textAlign: align(i),
                  }}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>
          {data.items.rows.map((row, ri) => {
            const w = rowWidths(row, widths)
            const note = row.flag === 'to-follow' || row.flag === 'gap'
            return (
              <View
                key={ri}
                wrap={false}
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 0.75,
                  borderBottomColor: C['io-est-rule'],
                }}
              >
                {row.cells.map((cell, ci) => {
                  const spanning = (cell.span ?? 1) > 1
                  return (
                    <Cell
                      key={ci}
                      cell={cell}
                      width={w[ci]!}
                      align={spanning && note ? 'left' : align(ci)}
                      color={
                        spanning && row.flag === 'to-follow'
                          ? C['io-est-tf']
                          : row.flag === 'gap' || cell.muted
                            ? C['io-est-sub']
                            : C['io-est-ink']
                      }
                      size={11.5}
                      lh={LH}
                      subSize={10.5}
                      subColor={C['io-est-sub']}
                      pad={[7, 8]}
                    />
                  )
                })}
              </View>
            )
          })}
        </View>
      ) : null}

      {data.totals.length ? (
        <View wrap={false} style={{ marginTop: px(12), marginLeft: 'auto', width: px(290) }}>
          {data.totals.map((t) => {
            const style = t.grand
              ? { ...f(12.5, LH), ...ink, fontWeight: 600 }
              : { ...f(11.5, LH), ...ink }
            return (
              <View
                key={t.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: px(t.grand ? 8 : 4),
                  paddingHorizontal: px(8),
                  ...(t.grand ? { backgroundColor: C['io-est-total'] } : {}),
                }}
              >
                <Text style={style}>{t.label}</Text>
                <Text style={style}>{t.value}</Text>
              </View>
            )
          })}
        </View>
      ) : null}

      {data.notes.length ? (
        <View style={{ marginTop: px(16) }}>
          {data.notes.map((n) => (
            <View key={n.label} wrap={false}>
              <Text
                style={{
                  ...f(11, 1.55),
                  fontWeight: 600,
                  color: C['io-est-strong'],
                  marginTop: px(8),
                  marginBottom: px(2),
                }}
              >
                {n.label}
              </Text>
              <Text style={{ ...f(10.5, 1.55), color: C['io-est-ink-2'] }}>{n.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.signer ? (
        <View
          wrap={false}
          style={{ marginTop: px(14), flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <View style={{ width: px(200) }}>
            {assets.signature ? <Img image={assets.signature} height={40} /> : null}
            <View
              style={{ borderTopWidth: 0.75, borderTopColor: C['io-est-line'], paddingTop: px(4) }}
            >
              <Text style={{ ...f(10.5, LH), color: C['io-est-sign'] }}>
                For {letterhead.legalName}
              </Text>
              <Text style={{ ...f(10.5, LH), color: C['io-est-sign'] }}>{data.signer}</Text>
            </View>
          </View>
          <View style={{ width: px(200) }}>
            {assets.stamp ? <Img image={assets.stamp} height={60} /> : null}
            <View
              style={{ borderTopWidth: 0.75, borderTopColor: C['io-est-line'], paddingTop: px(4) }}
            >
              <Text style={{ ...f(10.5, LH), color: C['io-est-sign'] }}>Company stamp</Text>
            </View>
          </View>
        </View>
      ) : null}
    </Page>
  )
}
