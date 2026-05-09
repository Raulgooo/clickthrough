# User B Kickoff: DOM Scanner And SharkAuth

## Mission

Own page perception and browser actions. The scanner must work on controlled demo pages, real SharkAuth, and generic web pages through DOM and accessibility heuristics.

## Primary Files

- `frontend/src/browser/`
- future extension/content bridge files if needed

## First Tasks

- Improve `scanDom()` to extract forms, tables, dialogs, labels, and nearby context.
- Make stable element references robust across re-scan.
- Implement safe action tools: highlight, click, fill, select, waitFor, verify.
- Point the scanner at the real SharkAuth workspace and capture the API key workflow affordances.
- Prefer generic DOM action execution; add typed SharkAuth tool only if DOM execution is too brittle.

## Done When

- Scanner returns a useful `PageContextPacket` from SharkAuth.
- Action executor can run an approved step plan.
- Re-scan after action can support verification.
- No mutating action runs without approval from the harness.
