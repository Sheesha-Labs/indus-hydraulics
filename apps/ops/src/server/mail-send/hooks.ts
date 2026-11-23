import 'server-only'

/**
 * Checks later sprints plug into the send gate (S04-T06). Each returns null to pass or a reason to stop.
 *
 *   basis       S06: the record versions the approval was built on (`basis_hash`). A different current hash
 *               means the proposal is stale: the row becomes `superseded` and comes back as a redraft.
 *   identifier  S12 (ADR-13): the identifier check on the exact outgoing bytes. Until it is registered, a
 *               supplier-bound row needs a stored passing result (`identifierCheck.passed === true`), so no
 *               supplier mail can leave unchecked.
 *   extra       guardrails, credit hold and anything else that must be re-checked at the last moment.
 *
 * Hooks receive the row's id and kind only; they load what they need themselves.
 */
export type GateHookInput = { outboundId: string; kind: string; basisHash: string | null }
export type BasisHook = (input: GateHookInput) => Promise<string | null>
export type IdentifierHook = (input: GateHookInput) => Promise<{ passed: boolean; reason?: string }>
export type ExtraHook = (input: GateHookInput) => Promise<string | null>

type Registry = {
  basis: BasisHook | null
  identifier: IdentifierHook | null
  extra: Map<string, ExtraHook>
}

const registry: Registry = { basis: null, identifier: null, extra: new Map() }

/** S06 registers the staleness check: return the CURRENT basis hash for the row's subject. */
export function registerBasisHook(hook: BasisHook | null): void {
  registry.basis = hook
}

/** S12 registers the identifier check. */
export function registerIdentifierHook(hook: IdentifierHook | null): void {
  registry.identifier = hook
}

export function registerGateCheck(name: string, hook: ExtraHook | null): void {
  if (hook) registry.extra.set(name, hook)
  else registry.extra.delete(name)
}

export function gateHooks(): Readonly<Registry> {
  return registry
}

/** Tests only: forget every hook. */
export function resetGateHooks(): void {
  registry.basis = null
  registry.identifier = null
  registry.extra.clear()
}
