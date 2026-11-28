import {
  housePageLabel,
  type DocBlock,
  type DocPage,
  type HouseDocument,
  type Letterhead,
} from '@indus/ops-core'
import { Page, Text, View } from '@react-pdf/renderer'
import { SANS, SERIF } from '../fonts'
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
 * The house A4 layout (everything but the client quotation), one page of paginate() at a time, drawn with the
 * HTML HouseLayout's own sizes, leading and spacing: letterhead, eyebrow + serif title + number, meta grid,
 * parties, subject band, then the blocks in order (line table, totals, numbered sections, terms, bank with
 * disclaimer and signature, sign line, slips, remark), and the footer. Continuation pages carry a running
 * header in place of the letterhead block.
 */
const eyebrow = (size = 9) => ({
  ...f(size),
  fontWeight: 500,
  letterSpacing: px(size * 0.16),
  color: C['io-accent'],
  textTransform: 'uppercase' as const,
})
const label = {
  ...f(9),
  letterSpacing: px(9 * 0.14),
  textTransform: 'uppercase' as const,
}

export default function HouseLayout({
  page,
  letterhead,
  assets,
  draft,
}: {
  /** One page of paginate(): its slice of the document and its position. */
  page: DocPage<HouseDocument>
  letterhead: Letterhead
  assets: PdfAssets
  draft?: boolean
}) {
  const data = page.data
  return (
    <Page
      size={data.page?.size === 'Letter' ? 'LETTER' : 'A4'}
      style={{
        fontFamily: SANS,
        color: C['io-ink'],
        paddingTop: px(44),
        paddingHorizontal: px(48),
        paddingBottom: px(70),
      }}
    >
      {draft ? <Watermark /> : null}
      <Footer
        left={`${letterhead.legalName} — ${data.eyebrow} # ${data.no}`}
        middle={data.footLabel}
        label={housePageLabel(page.page, page.pageCount)}
        size={9.5}
        bottom={30}
      />
      {page.first ? (
        <>
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
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{ ...f(14, 1.2), fontWeight: 500, color: C['io-ink'], marginBottom: px(4) }}
              >
                {letterhead.legalName}
              </Text>
              {[`TRN ${letterhead.trn}`, ...letterhead.addressLines, letterhead.mailbox].map(
                (l) => (
                  <Text
                    key={l}
                    style={{
                      ...f(10, 1.8),
                      color: C['io-ink-2'],
                      letterSpacing: px(0.3),
                      textAlign: 'right',
                    }}
                  >
                    {l}
                  </Text>
                )
              )}
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
              <Text style={eyebrow()}>{data.eyebrow}</Text>
              {/* The screen's title computes to 48 px at 1.5 leading (tailwind-merge drops its leading-none
                  for the text size that follows it), so the file draws it the same. */}
              <Text
                style={{
                  ...f(48, 1.5),
                  fontFamily: SERIF,
                  marginTop: px(10),
                  letterSpacing: px(-0.96),
                }}
              >
                {data.title}
              </Text>
              <Text style={{ ...f(13), marginTop: px(10) }}># {data.no}</Text>
            </View>
            {/* Two columns, as the HTML grid: labels left-aligned in one, values right-aligned in the other. */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: px(20) }}>
                {data.meta.map((m) => (
                  <View
                    key={m.label}
                    style={{ height: px(18), marginBottom: px(6), justifyContent: 'center' }}
                  >
                    <Text style={{ ...label, color: C['io-ink-3'] }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {data.meta.map((m) => (
                  <Text key={m.label} style={{ ...f(12), marginBottom: px(6), textAlign: 'right' }}>
                    {m.value}
                  </Text>
                ))}
              </View>
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
              {data.party.map((p, i) => (
                <View
                  key={p.label}
                  style={{ width: px(333), ...(i % 2 === 0 ? { marginRight: px(32) } : {}) }}
                >
                  <Text style={eyebrow()}>{p.label}</Text>
                  <Text style={{ ...f(13, 1.55), fontWeight: 500, marginTop: px(6) }}>
                    {p.name}
                  </Text>
                  {p.lines.map((l) => (
                    <Text key={l} style={{ ...f(12, 1.55), color: C['io-ink-2'] }}>
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
                alignItems: 'flex-end',
              }}
            >
              <Text style={{ ...eyebrow(), color: C['io-ink-2'], marginRight: px(12) }}>
                {data.subject.label ?? 'Subject'}
              </Text>
              <Text style={{ ...f(12.5), fontWeight: 600, letterSpacing: px(0.125) }}>
                {data.subject.text}
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <RunningHeader text={`${data.title} # ${data.no}`} />
      )}

      {data.blocks.map((b, i) => (
        <Block
          key={`${b.t}-${i}`}
          block={b}
          letterhead={letterhead}
          assets={assets}
          first={page.first || i > 0}
        />
      ))}
    </Page>
  )
}

function Block({
  block,
  letterhead,
  assets,
  first,
}: {
  block: DocBlock
  letterhead: Letterhead
  assets: PdfAssets
  /** False for a table continuing at the top of a page: no gap above its header. */
  first: boolean
}) {
  switch (block.t) {
    case 'table': {
      const desc = block.descCol ?? 1
      const widths = columnWidths(block.cols, desc)
      const align = (i: number) => (i === 0 || i === desc ? 'left' : 'right')
      return (
        <View style={{ marginTop: px(first ? 16 : 0) }}>
          <View style={{ flexDirection: 'row', backgroundColor: C['io-navy'] }}>
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
                  style={{ ...label, fontWeight: 500, color: C['io-card'], textAlign: align(i) }}
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
                    lh={ci === desc ? 1.45 : 1.5}
                    subSize={10}
                    subGap={2}
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
          <Text style={{ ...f(11.5, 1.55), width: '45%', color: C['io-ink-2'] }}>
            {block.words ?? ''}
          </Text>
          <View style={{ width: px(300) }}>
            {block.rows.map((r) => (
              <View
                key={r.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
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
                <Text
                  style={
                    r.grand ? { ...f(12), fontWeight: 600 } : { ...f(12), color: C['io-ink-2'] }
                  }
                >
                  {r.label}
                </Text>
                <Text style={r.grand ? { ...f(16), fontWeight: 500 } : f(12)}>{r.value}</Text>
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
          <View
            style={{
              backgroundColor: C['io-navy'],
              paddingVertical: px(3),
              paddingHorizontal: px(6),
              marginRight: px(10),
            }}
          >
            <Text style={{ ...f(9), color: C['io-card'], fontWeight: 500 }}>{block.n}</Text>
          </View>
          <Text style={{ ...f(13), fontWeight: 500, letterSpacing: px(-0.13) }}>{block.title}</Text>
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
                  ...label,
                  width: px(130),
                  marginRight: px(16),
                  paddingTop: px(2),
                  fontWeight: 500,
                  color: C['io-ink-2'],
                }}
              >
                {r.label}
              </Text>
              <Text style={{ ...f(12), flex: 1 }}>{r.value || ' '}</Text>
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
          <View style={{ width: '58%' }}>
            {block.showLabel !== false ? (
              <Text style={{ ...eyebrow(), marginBottom: px(4) }}>Bank details</Text>
            ) : null}
            {(letterhead.bank.lines.length
              ? letterhead.bank.lines
              : ['Bank details to follow']
            ).map((l) => (
              <Text key={l} style={{ ...f(10.5, 1.75), color: C['io-ink-2'] }}>
                {l}
              </Text>
            ))}
            {block.disclaimer ? (
              <Text style={{ ...f(10.5, 1.5), marginTop: px(10), color: C['io-ink-3'] }}>
                <Text style={{ fontWeight: 600 }}>Disclaimer:</Text> {block.disclaimer}
              </Text>
            ) : null}
          </View>
          {sign ? (
            <View style={{ width: px(230), justifyContent: 'flex-end' }}>
              <Text style={{ ...f(11.5), color: C['io-ink-2'] }}>{sign.lead}</Text>
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
                style={{ ...f(12.5, 1.5), marginTop: px(8), fontWeight: 500, color: C['io-ink'] }}
              >
                {sign.name}
              </Text>
              <Text style={{ ...f(11.5), color: C['io-ink-2'] }}>{sign.role}</Text>
              <Text style={{ ...f(11.5), color: C['io-ink-2'] }}>{letterhead.legalName}</Text>
              {assets.stamp ? <Img image={assets.stamp} height={60} /> : null}
            </View>
          ) : null}
          {block.side ? (
            <View style={{ width: px(230) }}>
              <Text style={{ ...f(11.5, 1.55), fontWeight: 500, color: C['io-ink'] }}>
                {block.side.label}
              </Text>
              <Text style={{ ...f(11.5, 1.55), color: C['io-ink-2'] }}>{block.side.text}</Text>
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
          }}
        >
          <Text style={{ ...f(11), color: C['io-ink-2'] }}>{block.lead}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                width: px(200),
                height: px(22),
                borderBottomWidth: 0.75,
                borderBottomColor: C['io-doc-sign'],
              }}
            />
            <Text style={{ ...f(11), fontWeight: 500, color: C['io-ink'], marginTop: px(2) }}>
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
                width: '48.5%',
                borderWidth: 0.75,
                borderColor: C['io-doc-sign'],
                paddingVertical: px(12),
                paddingHorizontal: px(14),
              }}
            >
              <Text style={{ ...eyebrow(), color: C['io-ink-3'], marginBottom: px(14) }}>
                {box.title}
              </Text>
              {box.fields.map((field) => (
                <View
                  key={field}
                  style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: px(16) }}
                >
                  <Text
                    style={{ ...f(11), width: px(70), marginRight: px(10), color: C['io-ink-2'] }}
                  >
                    {field}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: px(/^stamp/i.test(field) ? 54 : /^sign/i.test(field) ? 28 : 16),
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
          <Text style={{ ...f(11), color: C['io-ink-3'] }}>{block.text}</Text>
        </View>
      )
  }
}
