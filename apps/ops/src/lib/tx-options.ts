/**
 * Interactive transaction options for every request and job (S08 lifted them out of define-action).
 * `maxWait`: queue for the instance's one pooled connection as long as the pooler would (`pool_timeout` 20 s).
 * `timeout`: below `statement_timeout` (15 s) and far below `idle_in_transaction_session_timeout` (30 s) on ops_app.
 */
export const TX_OPTIONS = { maxWait: 20_000, timeout: 10_000 } as const
