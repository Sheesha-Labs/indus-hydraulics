// Blog short answers, 2026-10-10 (already applied to production; no deploy).
//
// Inserts a direct_answer block — a search-phrased question carrying the post's
// focus keyword, answered in 40–75 words from facts already in the post — at
// the top of the 36 published posts that had none (after the lead paragraph
// where a post opens with one), and trims the one answer over 90 words
// (snap-hooks-and-quick-links). Answers are in answers.json.
//
//   DATABASE_URL=… node write.cjs                    # dry run
//   DATABASE_URL=… node write.cjs --write <backup>   # write, backing up bodyBlocks
//
// Re-running skips any post that already has a direct answer.
const { createRequire } = require('module')
const fs = require('fs')
const db = new (createRequire(__dirname + '/../../../package.json')('@prisma/client').PrismaClient)()
const A = JSON.parse(fs.readFileSync(__dirname + '/answers.json', 'utf8'))
const WRITE = process.argv[2] === '--write', BACKUP = process.argv[3]
;(async () => {
  const posts = await db.blogPost.findMany({ where: { slug: { in: Object.keys(A) } }, select: { id: true, slug: true, bodyBlocks: true } })
  const plan = [], backup = {}
  for (const p of posts) {
    const b = Array.isArray(p.bodyBlocks) ? p.bodyBlocks : []
    const a = A[p.slug]; const block = { type: 'direct_answer', question: a.question, answer: a.answer }
    if (a.question.length > 200 || a.answer.length > 600) throw new Error('limit ' + p.slug)
    const iDA = b.findIndex(x => x.type === 'direct_answer')
    let next
    if (iDA !== -1) {
      if (p.slug !== 'snap-hooks-and-quick-links') { console.log('skip (already has DA)', p.slug); continue }
      next = b.map((x, i) => (i === iDA ? block : x))
    } else {
      const at = b[0]?.type === 'lead' ? 1 : 0
      next = [...b.slice(0, at), block, ...b.slice(at)]
    }
    backup[p.slug] = b; plan.push({ id: p.id, slug: p.slug, next, at: next.indexOf(block) })
  }
  console.log(plan.length, 'posts to write;', plan.map(x => x.slug + '@' + x.at).slice(0, 6).join(', '), '…')
  if (!WRITE) return db.$disconnect()
  fs.writeFileSync(BACKUP, JSON.stringify(backup))
  for (const x of plan) await db.blogPost.update({ where: { id: x.id }, data: { bodyBlocks: x.next } })
  console.log('written; backup', BACKUP)
  await db.$disconnect()
})()
