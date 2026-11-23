import { describe, expect, it } from 'vitest'
import {
  BUCKET_SPECS,
  OPS_BUCKETS,
  OPS_BUCKET_NAMES,
  STOREFRONT_BUCKETS,
  formatBucketPlan,
  planBuckets,
} from './buckets'

const MB = 1024 * 1024

describe('OPS_BUCKETS (C29)', () => {
  it('names the seven private buckets, all prefixed ops-', () => {
    expect(OPS_BUCKETS).toEqual({
      mail: 'ops-mail',
      documents: 'ops-documents',
      uploads: 'ops-uploads',
      company: 'ops-company',
      imports: 'ops-imports',
      evals: 'ops-evals',
      backup: 'ops-backup',
    })
    for (const name of OPS_BUCKET_NAMES) expect(name.startsWith('ops-')).toBe(true)
  })

  it('never overlaps the storefront buckets', () => {
    for (const name of STOREFRONT_BUCKETS) {
      expect((OPS_BUCKET_NAMES as readonly string[]).includes(name)).toBe(false)
    }
  })

  it('every spec is private; 25 MB for mail, 20 MB for the rest; company takes PNG and JPEG only', () => {
    for (const name of OPS_BUCKET_NAMES) {
      expect(BUCKET_SPECS[name].public).toBe(false)
      expect(BUCKET_SPECS[name].fileSizeLimit).toBe(name === 'ops-mail' ? 25 * MB : 20 * MB)
    }
    expect(BUCKET_SPECS['ops-company'].allowedMimeTypes).toEqual(['image/png', 'image/jpeg'])
  })
})

describe('planBuckets (create-buckets.ts refusal rules)', () => {
  it('creates every missing bucket with its spec', () => {
    const plan = planBuckets([{ name: 'product-images', public: true }])
    expect(plan.map((r) => r.action)).toEqual(Array.from({ length: 7 }, () => 'create'))
    const company = plan.find((r) => r.name === 'ops-company')
    expect(company).toEqual({
      name: 'ops-company',
      action: 'create',
      spec: BUCKET_SPECS['ops-company'],
    })
  })

  it('leaves an existing private bucket exactly as it is', () => {
    const plan = planBuckets([{ name: 'ops-mail', public: false }])
    expect(plan.find((r) => r.name === 'ops-mail')).toEqual({ name: 'ops-mail', action: 'exists' })
    expect(plan.filter((r) => r.action === 'create')).toHaveLength(6)
  })

  it('refuses (changes nothing) when one of ours is public', () => {
    const plan = planBuckets([{ name: 'ops-company', public: true }])
    const row = plan.find((r) => r.name === 'ops-company')
    expect(row?.action).toBe('refuse')
  })

  it('prints names and actions only', () => {
    const text = formatBucketPlan(planBuckets([{ name: 'ops-evals', public: false }]))
    expect(text).toContain('ops-evals')
    expect(text).toContain('exists')
    expect(text).toContain('25 MB')
    expect(text.split('\n')).toHaveLength(8)
  })
})
