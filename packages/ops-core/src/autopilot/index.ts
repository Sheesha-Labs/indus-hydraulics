// Autopilot rules (ADR-10): action keys, levels and their order, fixed rules, presets. Pure; the
// catalogue rows live in ops.autopilot_action_def (seeded by S03-T06) and the current levels in
// ops.autopilot_setting. resolveLevel() (guardrails only lower) arrives with S05/S07.
export * from './keys'
export * from './levels'
export * from './presets'
export * from './resolve-interim'
