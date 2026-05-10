# Clickthrough Demo Competence Fix Spec

## The 4 Fundamental Issues

1. **Vision + Context** — The model is text-blind. It parses `innerText` dumps instead of seeing the page.
2. **Structured DOM** — The DOM scanner emits flat element lists, not semantic page understanding.
3. **Real Agent Loop** — The harness is a linear pipeline, not a loop. No replanning, no verification.
4. **Progressive UI** — UI appears as skeleton → static final. No visible streaming assembly.

---

## Issue 1: Vision + Context

### Current State
- Model receives: page title, URL, 1200 chars of visible text, 20 element summaries
- Model never sees layout, images, profile pictures, tweet structure, PDF formatting

### Target State
- Harness captures viewport screenshot
- Vision model (or multi-modal prompt) produces structured page annotation
- Annotation includes: page type, key entities, layout regions, selected content semantics

### Implementation Plan
- **Browser layer**: Add `captureViewport()` using `html2canvas` or native `chrome.tabs.captureVisibleTab`
- **Context builder**: If vision is available, send screenshot + text to vision-capable model
- **Vision prompt**: "Describe this webpage. What type of page is it? What is the main content? Who posted it? What is selected?"
- **Fallback**: If no vision API, use enhanced structured DOM (Issue 2)
- **Demo impact**: Twitter scene — model sees the tweet, avatar, handle, timestamp. PDF scene — model sees the actual page layout.

### Files to Change
- `frontend/src/browser/captureViewport.ts` — implement screenshot capture
- `frontend/src/browser/pageBridge.ts` — include screenshot in context packet
- `frontend/src/harness/runtime/openrouter.ts` — vision prompt and context formatting

---

## Issue 2: Structured DOM

### Current State
- `domScanner.ts` returns: `visibleText` (4000 chars), `elements` (flat list of 120 interactive elements), `capabilities` (button/link/input mapping)
- `formatPageContext()` concatenates this into a text wall

### Target State
- DOM scanner classifies page type: `twitter`, `pdf`, `dashboard`, `chat`, `article`, `ecommerce`, `generic`
- Scanner extracts semantic structures:
  - **Posts/tweets**: author, handle, text, timestamp, engagement
  - **Articles**: title, author, publish date, headings hierarchy
  - **Forms**: fields, labels, submit buttons, validation
  - **Tables**: headers, row count, key columns
  - **Chat**: messages with sender, timestamp, thread
- Context is sent as structured JSON, not text dump

### Implementation Plan
- **Page classifier**: Heuristic-based classifier using URL, title, DOM structure
  - URL contains `twitter.com` + has tweet-like DOM → `twitter`
  - Title contains `PDF` or URL ends in `.pdf` → `pdf`
  - Has `<table>` with many rows + form inputs → `dashboard`
  - Has message bubbles with timestamps → `chat`
- **Semantic extractors** per page type:
  - `extractTweet()`: finds tweet container, extracts author, handle, text, timestamp
  - `extractArticle()`: finds headings hierarchy, extracts main content
  - `extractForm()`: groups labels with inputs, finds submit actions
  - `extractTable()`: extracts headers and sample rows
  - `extractChat()`: extracts message bubbles with sender/text/time
- **Context formatter**: Emit structured JSON instead of text wall

### Files to Change
- `frontend/src/browser/domScanner.ts` — add page classification and semantic extraction
- `frontend/src/browser/pageBridge.ts` — include structured context
- `frontend/src/harness/runtime/openrouter.ts` — consume structured context in prompts

---

## Issue 3: Real Agent Loop

### Current State
```
receiving_intent → observing_page → classifying_intent → planning → running_tools → generating_ui → completed
```
Linear. One search. One UI generation. No verification.

### Target State
```
receiving_intent → observing_page → classifying_intent → planning → 
  loop:
    execute_tools → synthesize → verify_synthesis → if_failed replan → 
  generate_ui → verify_ui → if_invalid repair → 
completed
```

### Implementation Plan
- **Multi-step search**:
  - Step 1: Search with broad query
  - Step 2: If results weak, refine query (e.g., add "LinkedIn", "GitHub", site-specific)
  - Step 3: Fetch top 2-3 sources for actual content
  - Step 4: Synthesize evidence with stance, quality, relevance
- **Synthesis step**: Before UI generation, harness synthesizes:
  ```json
  {
    "claim": "Raul Garcia joining Amazon as summer intern",
    "sources": [
      { "title": "...", "url": "...", "stance": "neutral", "relevance": 0.6, "verifies": false }
    ],
    "finding": "No primary source found. One secondary source mentions Amazon internships generally.",
    "verdict": "unverified",
    "confidence": 25
  }
  ```
- **Replanning**: If search yields no relevant results, harness should:
  - Retry with different queries
  - Or downgrade to "insufficient evidence" UI
- **UI verification**: After generation, validate that claims in UI match synthesis. If mismatch → repair or fallback.

### Files to Change
- `frontend/src/harness/runtime/session.ts` — implement real loop with tool execution, synthesis, replanning
- `frontend/src/harness/runtime/openrouter.ts` — add synthesis prompt, multi-query search
- `frontend/src/harness/runtime/tools.ts` — add source fetch to search pipeline

---

## Issue 4: Progressive UI

### Current State
- Skeleton emitted once
- Final UI replaces skeleton in one big patch
- No visible progressive assembly
- Interactive elements (toggle, slider) don't trigger re-renders

### Target State
- UI streams in as evidence is gathered:
  1. Skeleton + claim extraction (0.5s)
  2. Identity card appears (1s)
  3. Evidence sources stream in one by one (2-3s)
  4. Confidence meter updates as sources arrive (2-4s)
  5. Verdict card lands last (3-5s)
- User interactions trigger re-generation:
  - Toggle "With PKCE" → harness re-invokes with new state → UI updates
  - Slider changes tone → harness re-invokes → draft text updates

### Implementation Plan
- **Streaming patches**: Instead of one `ui.patch` with full tree, emit multiple patches:
  - Patch 1: `path: "/children/0"` → add ClaimCard
  - Patch 2: `path: "/children/2"` → add EvidenceSource 1
  - Patch 3: `path: "/children/2"` → add EvidenceSource 2
  - Patch 4: `path: "/children/5"` → replace ConclusionCard with updated verdict
- **Partial tree generation**: Model generates full tree, but harness breaks it into staged emits based on `ProgressList` items
- **State-driven re-invocation**: When user interacts (toggle, slider, button), content script sends `user.steering` event to harness with new state. Harness re-runs `generateUiTree` with updated context.

### Files to Change
- `frontend/src/harness/runtime/session.ts` — emit staged UI patches
- `frontend/src/extension/content.tsx` — handle re-invocation on interaction
- `frontend/src/renderer/PrimitiveRenderer.tsx` — already has local state, needs to emit events back to harness

---

## Implementation Priority

### Phase 1 (Highest Impact, Fastest)
1. **Structured DOM** — Fix context quality immediately. Improves ALL scenes.
2. **Dynamic Fallbacks** — Make all 4 fallback UIs use actual context instead of hardcoded content.

### Phase 2 (Medium Effort, High Impact)
3. **Real Agent Loop** — Add source fetching and synthesis. Makes Verify scene compelling.
4. **Progressive UI** — Stream evidence cards one by one. Makes demo feel alive.

### Phase 3 (Highest Effort, Transformative)
5. **Vision** — Add screenshot capture. Only if time permits and API budget allows.

---

## Acceptance Criteria

### Issue 1: Vision + Context
- [ ] `buildPageContextPacket` includes screenshot data URI when available
- [ ] Vision prompt produces structured annotation
- [ ] Twitter scene: model identifies tweet author, handle, text without text-dump parsing

### Issue 2: Structured DOM
- [ ] `domScanner.ts` detects page type with >80% accuracy for Twitter, PDF, chat
- [ ] `formatPageContext()` emits JSON structure, not text wall
- [ ] Twitter scene: structured context includes `pageType: "twitter"`, `post.author`, `post.text`

### Issue 3: Real Agent Loop
- [ ] Harness fetches top 2 search sources before generating UI
- [ ] Evidence synthesis step produces structured findings with stance
- [ ] UI claims match fetched sources (no hallucination)
- [ ] If search yields nothing, harness retries with refined query

### Issue 4: Progressive UI
- [ ] Verify scene: evidence cards appear one by one with 300ms delays
- [ ] Toggle interactions trigger UI re-generation
- [ ] Skeleton is replaced progressively, not all at once

---

## Files Changed Summary

| File | Issue | Change |
|---|---|---|
| `frontend/src/browser/domScanner.ts` | 2 | Add page classification, semantic extraction |
| `frontend/src/browser/pageBridge.ts` | 1, 2 | Include screenshot, structured context |
| `frontend/src/browser/captureViewport.ts` | 1 | Implement screenshot capture |
| `frontend/src/harness/runtime/session.ts` | 3, 4 | Real loop, source fetch, staged patches |
| `frontend/src/harness/runtime/openrouter.ts` | 1, 2, 3 | Vision prompt, structured context, synthesis, multi-query |
| `frontend/src/harness/runtime/tools.ts` | 3 | Source fetch in search pipeline |
| `frontend/src/extension/content.tsx` | 4 | Handle re-invocation on interaction |
| `frontend/src/renderer/PrimitiveRenderer.tsx` | 4 | Emit state changes back to harness |
