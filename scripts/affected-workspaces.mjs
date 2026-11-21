#!/usr/bin/env node
// Which workspace packages does the diff between two commits affect?
//
//   node scripts/affected-workspaces.mjs <base> <head>
//
// Prints one package name per line, or the single line ALL. Used by
// scripts/vercel-ignore-build.sh so an Ops-only commit never builds (and so never
// wipes the ISR cache of) the storefront, and a website-only commit never builds
// Ops (ADR-02). Plain Node with no dependencies: Vercel runs the Ignored Build
// Step before anything is installed.
//
// Rules:
//   - A file inside a workspace affects that workspace and every workspace that
//     depends on it, transitively (dependencies, devDependencies, peerDependencies).
//   - Global inputs affect everything (root manifest, Bun and TypeScript config,
//     shared types, lint and format config, the ignore logic itself).
//   - bun.lock is attributed to the workspaces whose package.json changed in the
//     same diff; a lockfile change with no manifest change prints ALL.
//   - Anything else outside every workspace (docs/, .github/, scripts/ci/) affects
//     nothing.
//   - Any error prints ALL: when the answer is unknown, build.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const GLOBAL = [
  /^package\.json$/,
  /^bunfig\.toml$/,
  /^tsconfig\.base\.json$/,
  /^types\//,
  /^\.oxlintrc\.json$/,
  /^\.prettierrc$/,
  /^scripts\/vercel-ignore-build\.sh$/,
  /^scripts\/affected-workspaces\.mjs$/,
]

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function workspaceDirs(root) {
  const patterns = readJson(join(root, 'package.json')).workspaces ?? []
  const dirs = []
  for (const pattern of patterns) {
    if (!pattern.endsWith('/*')) {
      dirs.push(pattern)
      continue
    }
    const parent = pattern.slice(0, -2)
    for (const entry of readdirSync(join(root, parent), { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(root, parent, entry.name, 'package.json'))) {
        dirs.push(`${parent}/${entry.name}`)
      }
    }
  }
  return dirs
}

export function affected(root, changed) {
  if (changed.some((f) => GLOBAL.some((re) => re.test(f)))) return 'ALL'

  const dirs = workspaceDirs(root)
  const nameOf = new Map()
  const deps = new Map()
  for (const dir of dirs) {
    const manifest = readJson(join(root, dir, 'package.json'))
    nameOf.set(dir, manifest.name)
    deps.set(manifest.name, [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ])
  }
  const names = new Set(nameOf.values())
  const dependents = new Map([...names].map((n) => [n, []]))
  for (const [name, list] of deps) {
    for (const dep of list) if (names.has(dep)) dependents.get(dep).push(name)
  }

  const touched = new Set()
  const manifestsChanged = []
  for (const file of changed) {
    const dir = dirs.find((d) => file === d || file.startsWith(d + '/'))
    if (!dir) continue
    touched.add(nameOf.get(dir))
    if (file === `${dir}/package.json`) manifestsChanged.push(nameOf.get(dir))
  }
  if (changed.includes('bun.lock') && manifestsChanged.length === 0) return 'ALL'

  const out = new Set()
  const queue = [...touched]
  while (queue.length) {
    const name = queue.shift()
    if (out.has(name)) continue
    out.add(name)
    queue.push(...dependents.get(name))
  }
  return [...out].sort()
}

function main() {
  const [base, head] = process.argv.slice(2)
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
    const changed = execFileSync('git', ['diff', '--name-only', base, head], {
      cwd: root,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean)
    const result = affected(root, changed)
    process.stdout.write(result === 'ALL' ? 'ALL\n' : result.map((n) => n + '\n').join(''))
  } catch (error) {
    process.stderr.write(`affected-workspaces: ${error.message}\n`)
    process.stdout.write('ALL\n')
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main()
