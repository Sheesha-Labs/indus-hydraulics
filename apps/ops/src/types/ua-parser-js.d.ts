// ua-parser-js 1.x (MIT) ships no types; this is the part of its API Ops uses (server/access/devices.ts).
// Version 2 is AGPL and must not be installed in this public repository.
declare module 'ua-parser-js' {
  export interface UAParserResult {
    browser: { name?: string; version?: string; major?: string }
    os: { name?: string; version?: string }
    device: { vendor?: string; model?: string; type?: string }
  }
  export class UAParser {
    constructor(ua?: string)
    getResult(): UAParserResult
  }
}
