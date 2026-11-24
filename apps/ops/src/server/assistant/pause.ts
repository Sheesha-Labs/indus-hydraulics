import 'server-only'

/**
 * S04 read the pause from the interim settings row `assistant.paused`; S05-T02 moved it to the single row
 * `ops.assistant_state` (state.ts). This module keeps the S04 import path for its callers.
 */
export { assistantPauseState, isAssistantPaused, type PauseState } from './state'
