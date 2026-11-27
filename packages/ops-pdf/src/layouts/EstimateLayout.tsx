import {
  documentNumber,
  revisionLabel,
  type EstimateDocument,
  type Letterhead,
} from '@indus/ops-core'
import { Page, Text, View } from '@react-pdf/renderer'
import { SANS } from '../fonts'
import {
  C,
  Cell,
  columnWidths,
  Footer,
  Img,
  px,
  rowWidths,
  RunningHeader,
  Watermark,
  type PdfAssets,
} from '../parts'

/**
 * The client quotation in the Zoho Estimate look (ADR-14, board 156), drawn from the same EstimateDocument as
 * the HTML EstimateLayout: logo and company block with the TRN, "QUOTATION" and "# number" (a revision prints
 * "-R2"), bill-to and meta, the line table with a navy header repeated on every page, totals box, notes, the
 * signature and stamp strip, and "Page n of N".
 */
export default function EstimateLayout({
  data,
  letterhead,
  assets,
  draft,
}: {
  data: EstimateDocument
  letterhead: Letterhead
  assets: PdfAssets
  draft?: boolean
}) {
  const no = documentNumber(data.no, data.revision)
  const rev = revisionLabel(data.revision)
  const desc = data.items.descCol ?? 1
  const widths = columnWidths(data.items.cols, desc)
  const align = (i: number) => (i === 0 || i === desc ? 'left' : 'right')
  return (
    <Page
      size="A4"
      style={{
        fontFamily: SANS,
        fontSize: px(11.5),
        color: C['io-est-ink'],
        paddingTop: px(44),
        paddingHorizontal: px(48),
        paddingBottom: px(64),
      }}
    >
      {draft ? <Watermark /> : null}
      <Footer left={`${letterhead.legalName} · ${no}`} />
      <RunningHeader text={`${data.title} # ${no}`} />
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            {assets.logo ? <Img image={assets.logo} height={58} /> : null}
            <View
              style={{
                marginTop: px(6),
                fontSize: px(10.5),
                color: C['io-est-co'],
              }}
            >
              <Text style={{ fontSize: px(13), fontWeight: 600, color: C['io-est-strong'] }}>
                {letterhead.legalName}
              </Text>
              {letterhead.addressLines.map((line, i) => (
                <Text key={line}>
                  {line}
                  {i === letterhead.addressLines.length - 1 ? ` · TRN ${letterhead.trn}` : ''}
                </Text>
              ))}
              <Text>
                {letterhead.mailbox} · {letterhead.phone}
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontSize: px(30),
                fontWeight: 500,
                textAlign: 'right',
                letterSpacing: px(0.6),
                lineHeight: 1.15,
              }}
            >
              {data.title}
            </Text>
            <Text style={{ fontSize: px(12), textAlign: 'right', marginTop: px(4) }}># {no}</Text>
          </View>
        </View>

        {rev ? (
          <View style={{ marginTop: px(10), backgroundColor: C['io-est-rev'], padding: px(6) }}>
            <Text style={{ fontSize: px(11) }}>{rev}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: px(22), flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '50%' }}>
            <Text style={{ color: C['io-est-meta'] }}>{data.billTo.label}</Text>
            <Text style={{ fontWeight: 600 }}>{data.billTo.name}</Text>
            {data.billTo.lines.map((l) => (
              <Text key={l}>{l}</Text>
            ))}
          </View>
          <View>
            {data.meta.map((m) => (
              <View
                key={m.label}
                style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: px(3) }}
              >
                <Text style={{ color: C['io-est-meta'], marginRight: px(16) }}>{m.label}</Text>
                <Text style={{ textAlign: 'right' }}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: px(18) }}>
          <View fixed style={{ flexDirection: 'row', backgroundColor: C['io-navy'] }}>
            {data.items.cols.map((h, i) => (
              <View
                key={h}
                style={{ width: `${widths[i]}%`, paddingVertical: px(7), paddingHorizontal: px(8) }}
              >
                <Text
                  style={{
                    fontSize: px(10.5),
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
                          : note || cell.muted
                            ? C['io-est-sub']
                            : C['io-est-ink']
                      }
                      size={11.5}
                      subColor={C['io-est-sub']}
                      pad={[7, 8]}
                    />
                  )
                })}
              </View>
            )
          })}
        </View>

        <View wrap={false} style={{ marginTop: px(12), marginLeft: 'auto', width: px(290) }}>
          {data.totals.map((t) => (
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
              <Text style={t.grand ? { fontWeight: 600, fontSize: px(12.5) } : {}}>{t.label}</Text>
              <Text style={t.grand ? { fontWeight: 600, fontSize: px(12.5) } : {}}>{t.value}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: px(16),
            fontSize: px(10.5),
            color: C['io-est-ink-2'],
          }}
        >
          {data.notes.map((n) => (
            <View key={n.label} wrap={false}>
              <Text
                style={{
                  fontWeight: 600,
                  fontSize: px(11),
                  color: C['io-est-strong'],
                  marginTop: px(8),
                }}
              >
                {n.label}
              </Text>
              <Text>{n.text}</Text>
            </View>
          ))}
        </View>

        <View
          wrap={false}
          style={{
            marginTop: px(14),
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: px(10.5),
            color: C['io-est-sign'],
          }}
        >
          <View style={{ width: px(200) }}>
            {assets.signature ? <Img image={assets.signature} height={40} /> : null}
            <View
              style={{ borderTopWidth: 0.75, borderTopColor: C['io-est-line'], paddingTop: px(4) }}
            >
              <Text>For {letterhead.legalName}</Text>
              <Text>{data.signer}</Text>
            </View>
          </View>
          <View style={{ width: px(200) }}>
            {assets.stamp ? <Img image={assets.stamp} height={60} /> : null}
            <View
              style={{ borderTopWidth: 0.75, borderTopColor: C['io-est-line'], paddingTop: px(4) }}
            >
              <Text>Company stamp</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  )
}
