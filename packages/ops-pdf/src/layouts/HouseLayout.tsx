import type { DocBlock, HouseDocument, Letterhead } from '@indus/ops-core'
import { Page, Text, View } from '@react-pdf/renderer'
import { SANS, SERIF } from '../fonts'
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
 * The house A4 layout (everything but the client quotation): letterhead, eyebrow + serif title + number,
 * meta grid, parties, subject band, then the blocks in order (line table with a repeated header, totals,
 * numbered sections, terms, bank with disclaimer and signature, sign line, slips, remark), and the footer.
 * Drawn from the same HouseDocument as the HTML HouseLayout.
 */
const eyebrow = {
  fontSize: px(9),
  fontWeight: 500,
  letterSpacing: px(1.44),
  color: C['io-accent'],
  textTransform: 'uppercase' as const,
}

export default function HouseLayout({
  data,
  letterhead,
  assets,
  draft,
}: {
  data: HouseDocument
  letterhead: Letterhead
  assets: PdfAssets
  draft?: boolean
}) {
  return (
    <Page
      size="A4"
      style={{
        fontFamily: SANS,
        fontSize: px(12),
        color: C['io-ink'],
        paddingTop: px(44),
        paddingHorizontal: px(48),
        paddingBottom: px(64),
      }}
    >
      {draft ? <Watermark /> : null}
      <Footer
        left={`${letterhead.legalName} — ${data.eyebrow} # ${data.no}`}
        middle={data.footLabel}
      />
      <RunningHeader text={`${data.title} # ${data.no}`} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottomWidth: 0.75,
          borderBottomColor: C['io-ink'],
          paddingBottom: px(16),
        }}
      >
        {assets.logo ? <Img image={assets.logo} height={60} /> : <View />}
        <View
          style={{
            alignItems: 'flex-end',
            fontSize: px(10),
            color: C['io-ink-2'],
          }}
        >
          <Text
            style={{ fontSize: px(14), fontWeight: 500, color: C['io-ink'], marginBottom: px(4) }}
          >
            {letterhead.legalName}
          </Text>
          <Text>TRN {letterhead.trn}</Text>
          {letterhead.addressLines.map((l) => (
            <Text key={l}>{l}</Text>
          ))}
          <Text>{letterhead.mailbox}</Text>
        </View>
      </View>

      <View
        style={{
          marginTop: px(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <View>
          <Text style={eyebrow}>{data.eyebrow}</Text>
          <Text style={{ fontFamily: SERIF, fontSize: px(48), marginTop: px(10), lineHeight: 1 }}>
            {data.title}
          </Text>
          <Text style={{ fontSize: px(13), marginTop: px(10) }}># {data.no}</Text>
        </View>
        <View>
          {data.meta.map((m) => (
            <View
              key={m.label}
              style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: px(6) }}
            >
              <Text
                style={{
                  fontSize: px(9),
                  letterSpacing: px(1.26),
                  textTransform: 'uppercase',
                  color: C['io-ink-3'],
                  marginRight: px(20),
                }}
              >
                {m.label}
              </Text>
              <Text style={{ textAlign: 'right' }}>{m.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {data.party.length ? (
        <View
          style={{
            marginTop: px(18),
            paddingTop: px(14),
            borderTopWidth: 0.75,
            borderTopColor: C['io-ink'],
            flexDirection: 'row',
          }}
        >
          {data.party.map((p) => (
            <View key={p.label} style={{ width: '50%', paddingRight: px(16) }}>
              <Text style={eyebrow}>{p.label}</Text>
              <Text style={{ fontSize: px(13), fontWeight: 500, marginTop: px(6) }}>{p.name}</Text>
              {p.lines.map((l) => (
                <Text key={l} style={{ color: C['io-ink-2'] }}>
                  {l}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {data.subject ? (
        <View
          style={{
            marginTop: px(14),
            paddingVertical: px(12),
            paddingHorizontal: px(14),
            backgroundColor: C['io-fill-2'],
            flexDirection: 'row',
          }}
        >
          <Text style={{ ...eyebrow, color: C['io-ink-2'], marginRight: px(12) }}>
            {data.subject.label ?? 'Subject'}
          </Text>
          <Text style={{ fontSize: px(12.5), fontWeight: 600 }}>{data.subject.text}</Text>
        </View>
      ) : null}

      {data.blocks.map((b, i) => (
        <Block key={`${b.t}-${i}`} block={b} letterhead={letterhead} assets={assets} />
      ))}
    </Page>
  )
}

function Block({
  block,
  letterhead,
  assets,
}: {
  block: DocBlock
  letterhead: Letterhead
  assets: PdfAssets
}) {
  switch (block.t) {
    case 'table': {
      const desc = block.descCol ?? 1
      const widths = columnWidths(block.cols, desc)
      const align = (i: number) => (i === 0 || i === desc ? 'left' : 'right')
      return (
        <View style={{ marginTop: px(16) }}>
          <View fixed style={{ flexDirection: 'row', backgroundColor: C['io-navy'] }}>
            {block.cols.map((h, i) => (
              <View
                key={h}
                style={{
                  width: `${widths[i]}%`,
                  paddingVertical: px(9),
                  paddingHorizontal: px(10),
                }}
              >
                <Text
                  style={{
                    fontSize: px(9),
                    fontWeight: 500,
                    letterSpacing: px(1.26),
                    textTransform: 'uppercase',
                    color: C['io-card'],
                    textAlign: align(i),
                  }}
                >
                  {h}
                </Text>
              </View>
            ))}
          </View>
          {block.rows.map((row, ri) => {
            const w = rowWidths(row, widths)
            const quiet = row.flag === 'to-follow' || row.flag === 'gap'
            return (
              <View
                key={ri}
                wrap={false}
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 0.75,
                  borderBottomColor: C['io-doc-rule'],
                }}
              >
                {row.cells.map((cell, ci) => (
                  <Cell
                    key={ci}
                    cell={cell}
                    width={w[ci]!}
                    align={(cell.span ?? 1) > 1 ? 'left' : align(ci)}
                    color={
                      quiet || ci === 0 ? C['io-ink-3'] : cell.muted ? C['io-ink-4'] : C['io-ink']
                    }
                    size={ci === desc ? 12 : 11.5}
                    subColor={C['io-ink-3']}
                    pad={[8, 10]}
                  />
                ))}
              </View>
            )
          })}
        </View>
      )
    }
    case 'totals':
      return (
        <View
          wrap={false}
          style={{ marginTop: px(14), flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <Text style={{ width: '45%', fontSize: px(11.5), color: C['io-ink-2'] }}>
            {block.words ?? ''}
          </Text>
          <View style={{ width: px(300) }}>
            {block.rows.map((r) => (
              <View
                key={r.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: px(6),
                  ...(r.grand
                    ? {
                        borderTopWidth: 0.75,
                        borderTopColor: C['io-ink'],
                        marginTop: px(4),
                        paddingTop: px(10),
                      }
                    : { borderBottomWidth: 0.75, borderBottomColor: C['io-doc-rule'] }),
                }}
              >
                <Text style={r.grand ? { fontWeight: 600 } : { color: C['io-ink-2'] }}>
                  {r.label}
                </Text>
                <Text style={r.grand ? { fontSize: px(16), fontWeight: 500 } : {}}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )
    case 'section':
      return (
        <View
          wrap={false}
          style={{ marginTop: px(18), flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              backgroundColor: C['io-navy'],
              color: C['io-card'],
              fontSize: px(9),
              fontWeight: 500,
              paddingVertical: px(3),
              paddingHorizontal: px(6),
              marginRight: px(10),
            }}
          >
            {block.n}
          </Text>
          <Text style={{ fontSize: px(13), fontWeight: 500 }}>{block.title}</Text>
        </View>
      )
    case 'terms':
      return (
        <View style={{ marginTop: px(10), borderTopWidth: 0.75, borderTopColor: C['io-ink'] }}>
          {block.rows.map((r) => (
            <View
              key={r.label}
              wrap={false}
              style={{
                flexDirection: 'row',
                paddingVertical: px(6),
                borderBottomWidth: 0.75,
                borderBottomColor: C['io-doc-rule'],
              }}
            >
              <Text
                style={{
                  width: px(130),
                  marginRight: px(16),
                  fontSize: px(9),
                  fontWeight: 500,
                  letterSpacing: px(1.26),
                  textTransform: 'uppercase',
                  color: C['io-ink-2'],
                }}
              >
                {r.label}
              </Text>
              <Text style={{ flex: 1 }}>{r.value || ' '}</Text>
            </View>
          ))}
        </View>
      )
    case 'bank': {
      const sign = block.side ? false : (block.sign ?? false)
      return (
        <View
          wrap={false}
          style={{ marginTop: px(16), flexDirection: 'row', justifyContent: 'space-between' }}
        >
          <View style={{ width: '58%', fontSize: px(10.5), color: C['io-ink-2'] }}>
            {block.showLabel !== false ? (
              <Text style={{ ...eyebrow, marginBottom: px(4) }}>Bank details</Text>
            ) : null}
            {letterhead.bank.lines.length ? (
              letterhead.bank.lines.map((l) => <Text key={l}>{l}</Text>)
            ) : (
              <Text>Bank details to follow</Text>
            )}
            {block.disclaimer ? (
              <Text style={{ marginTop: px(10), color: C['io-ink-3'] }}>
                <Text style={{ fontWeight: 600 }}>Disclaimer: </Text>
                {block.disclaimer}
              </Text>
            ) : null}
          </View>
          {sign ? (
            <View style={{ width: px(230), fontSize: px(11.5), color: C['io-ink-2'] }}>
              <Text>{sign.lead}</Text>
              <View
                style={{
                  height: px(46),
                  borderBottomWidth: 0.75,
                  borderBottomColor: C['io-doc-sign'],
                }}
              >
                {assets.signature ? <Img image={assets.signature} height={44} /> : null}
              </View>
              <Text
                style={{
                  marginTop: px(8),
                  fontSize: px(12.5),
                  fontWeight: 500,
                  color: C['io-ink'],
                }}
              >
                {sign.name}
              </Text>
              <Text>{sign.role}</Text>
              <Text>{letterhead.legalName}</Text>
              {assets.stamp ? <Img image={assets.stamp} height={60} /> : null}
            </View>
          ) : null}
          {block.side ? (
            <View style={{ width: px(230), fontSize: px(11.5), color: C['io-ink-2'] }}>
              <Text style={{ fontWeight: 500, color: C['io-ink'] }}>{block.side.label}</Text>
              <Text>{block.side.text}</Text>
            </View>
          ) : null}
        </View>
      )
    }
    case 'sign':
      return (
        <View
          wrap={false}
          style={{
            marginTop: px(14),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: px(11),
            color: C['io-ink-2'],
          }}
        >
          <Text>{block.lead}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                width: px(200),
                height: px(22),
                borderBottomWidth: 0.75,
                borderBottomColor: C['io-doc-sign'],
              }}
            />
            <Text style={{ fontWeight: 500, color: C['io-ink'], marginTop: px(2) }}>
              {block.name}
            </Text>
          </View>
        </View>
      )
    case 'slips':
      return (
        <View
          wrap={false}
          style={{ marginTop: px(12), flexDirection: 'row', justifyContent: 'space-between' }}
        >
          {block.boxes.map((box) => (
            <View
              key={box.title}
              style={{
                width: '48%',
                borderWidth: 0.75,
                borderColor: C['io-doc-sign'],
                padding: px(12),
                fontSize: px(11),
                color: C['io-ink-2'],
              }}
            >
              <Text style={{ ...eyebrow, color: C['io-ink-3'], marginBottom: px(10) }}>
                {box.title}
              </Text>
              {box.fields.map((f) => (
                <View
                  key={f}
                  style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: px(14) }}
                >
                  <Text style={{ width: px(70) }}>{f}</Text>
                  <View
                    style={{
                      flex: 1,
                      height: px(/^stamp/i.test(f) ? 54 : /^sign/i.test(f) ? 28 : 16),
                      borderBottomWidth: 0.75,
                      borderBottomColor: C['io-doc-sign'],
                    }}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    case 'remark':
      return (
        <View
          wrap={false}
          style={{
            marginTop: px(14),
            minHeight: px(64),
            borderWidth: 0.75,
            borderColor: C['io-doc-sign'],
            paddingVertical: px(10),
            paddingHorizontal: px(14),
          }}
        >
          <Text style={{ fontSize: px(11), color: C['io-ink-3'] }}>{block.text}</Text>
        </View>
      )
  }
}
