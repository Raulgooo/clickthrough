# Clickthrough Demo Storyboard

## Core Vision

Clickthrough is a runtime interface layer for the web.

It does not make users leave the page. It does not answer beside the page. It watches the current browser context, understands the user's intent, and generates the exact overlay UI needed in that moment.

The demo should prove one thing:

> The browser can become intent-native.

Every scene should show the same pattern:

1. A person hits friction on an ordinary page.
2. They summon Clickthrough with a hotkey or voice prompt.
3. Clickthrough reads the page context.
4. It generates a beautiful, page-native overlay using GenUI primitives.
5. The user understands, verifies, or acts without navigating away.

The emotional hook:

> The web quietly reshapes itself around what you meant.

## Demo Format

Target length: 2-4 minutes.

Style: recorded demo with light acting from teammates.

Tone: ambitious, fast, funny, and obviously not a chatbot.

No slides. No pitch deck. The product explains itself through scenes.

## Cast

- **Raul**: the person referenced in the Twitter/X claim and owner of SharkAuth.
- **Teammate 1**: scrolling Twitter/X, skeptical, triggers the first verification moment.
- **Teammate 2**: reading a CS/OAuth PDF, confused, triggers the visual learning moment.
- **Teammate 3**: inside SharkAuth, needs to perform a real dashboard workflow.
- **Teammate 4**: comic relief in the final social-context scene.
- **Clickthrough / CT**: the invisible browser intelligence. It appears only as transparent prompt surfaces and generated overlay UIs.

## Product Principles Shown In The Demo

### 1. Never Leave The Page

Clickthrough is invoked in place. The user does not open a separate app, sidebar, or chatbot tab. The current page remains the environment.

### 2. Generate The Missing Interface

The answer is not text. The answer is a runtime UI:

- dashboards
- diagrams
- forms
- approval gates
- evidence panels
- generated action surfaces

### 3. Adapt To The Host Page

Clickthrough owns the primitives, but borrows the page's visual language.

Before rendering, CT samples:

- fonts
- colors
- spacing
- border radius
- input styles
- shadows and borders
- dark or light mode
- density

Then it renders generated components that blend with the current page.

Twitter/X gets an investigation overlay that feels native to a social feed.

The PDF reader gets an annotation and diagram layer.

SharkAuth gets an admin-console action panel that looks like it belongs in SharkAuth.

The chat/social scene gets a lightweight private explanation and response assistant.

### 4. Intent Categories

The full demo shows four kinds of intent:

- **Verify**: "Is this true?"
- **Understand**: "Explain this visually."
- **Act**: "Do this workflow for me."
- **Respond**: "Help me understand what to say."

Together, they make Clickthrough feel like a general browser agent, not a single-purpose tool.

## Scene 1: Verify Reality On Twitter/X

### Setup

Teammate 1 is casually scrolling Twitter/X in a browser.

They see a tweet from `raulgcc1`:

> I'm excited to announce that I'm joining Amazon as a summer intern!

Teammate 1 pauses.

They say:

> Wait, is Raul joining Amazon?

They press the Clickthrough hotkey.

A small transparent prompt appears over the current page, anchored near the tweet.

Teammate 1 asks:

> Hey CT, is this true?

### Clickthrough Behavior

CT highlights the exact claim inside the tweet:

> joining Amazon as a summer intern

The rest of the page subtly dims.

A skeleton dashboard begins rendering over the tweet. It should visibly assemble itself, proving this is generated UI.

Suggested generated sections:

- **Claim**
  - extracted statement
  - source page
  - author handle
- **Identity**
  - public profile signals for Raul
  - matching names, handles, GitHub, LinkedIn, personal site
- **Evidence Search**
  - LinkedIn employment history
  - GitHub/profile activity
  - personal website
  - web mentions
  - Amazon-related signals
- **Contradictions**
  - no matching Amazon internship signal found
  - no LinkedIn update found
  - no public announcement found outside the tweet
- **Verdict**
  - likely unverified or likely not true
  - confidence level
  - reason summary
- **Follow-Ups**
  - "show source trail"
  - "check original profile"
  - "watch for updates"
  - "draft a reply"

### Visual Moment

The dashboard starts as a skeleton:

```txt
Extracting claim...
Identifying person...
Searching public sources...
Checking profile consistency...
Building verdict...
```

Then each section fills in live.

The verdict should land clearly:

> I can't verify this. Public signals do not currently support the Amazon internship claim.

### Why This Wins

A chatbot could summarize search results.

Clickthrough generates an investigation dashboard directly over the tweet.

This shows the web becoming an evidence surface.

## Scene 2: Understand OAuth From A PDF

### Setup

Teammate 2 is reading a CS/security PDF about OAuth 2.0 Authorization Code Flow with PKCE.

The visible paragraph is dense:

> In the authorization code flow with PKCE, the client generates a code verifier and derives a code challenge, which is sent in the authorization request. After user authorization, the authorization server returns an authorization code to the redirect URI. The client then redeems the code along with the original verifier at the token endpoint.

Teammate 2 looks tired.

They say:

> I have read this three times. I still don't see what is happening.

They press the Clickthrough hotkey.

Teammate 2 asks:

> CT, explain this visually.

### Clickthrough Behavior

CT extracts the selected paragraph and generates a visual teaching overlay on top of the PDF.

Suggested generated sections:

- **Sequence Diagram**
  - User
  - Client App
  - Authorization Server
  - Resource Server
- **Step Controls**
  - Step 1: generate verifier
  - Step 2: derive challenge
  - Step 3: redirect to authorize
  - Step 4: return auth code
  - Step 5: exchange code + verifier
  - Step 6: receive token
- **Why PKCE Exists**
  - intercepted code alone is useless
  - attacker needs the verifier
- **Toggle**
  - with PKCE
  - without PKCE
- **Simplify**
  - "explain like I know HTTP"
  - "show with code"
  - "give me a memory trick"

### Visual Moment

The overlay animates arrows between actors.

The code verifier stays secret inside the client.

The code challenge travels through the browser redirect.

When the toggle switches to "without PKCE," the intercepted authorization code becomes dangerous.

When it switches back to "with PKCE," the intercepted code is shown as useless without the verifier.

### Why This Wins

A chatbot could explain OAuth in paragraphs.

Clickthrough turns a static PDF into an interactive lesson built from the paragraph the user was reading.

This shows the web becoming a learning surface.

## Scene 3: Act Inside SharkAuth

### Setup

Teammate 3 is inside the SharkAuth dashboard.

They need a full-permissions API key but do not know where the setting lives.

They say:

> I know this is somewhere in here, but I do not want to click through all this.

They press the Clickthrough hotkey.

Teammate 3 asks:

> CT, I need to create a new full-permissions API key.

### Clickthrough Behavior

CT scans the current SharkAuth page and available DOM actions.

It generates a SharkAuth-native action panel that looks like it belongs in the dashboard.

Suggested generated sections:

- **Goal**
  - Create full-permissions API key
- **Generated Form**
  - key name
  - environment
  - expiration
  - scopes
  - full permissions already selected
- **Risk Summary**
  - "This key can access all project resources."
  - "Store it securely. You will only see it once."
- **Approval Gate**
  - preview steps before execution
  - approve button
  - cancel button
- **Execution Log**
  - opening API key settings
  - selecting full scopes
  - creating key
  - verifying key exists
- **Result**
  - masked key
  - copy button
  - "save to environment variable" suggestion

### Visual Moment

The panel should inherit SharkAuth styling:

- same typography
- same controls
- same border radius
- same density
- same button style

It should feel like SharkAuth suddenly shipped the exact feature the user needed.

### Why This Wins

A chatbot could give instructions.

Clickthrough generates the working form, asks approval, executes the underlying workflow, and verifies completion.

This shows the web becoming an action surface.

## Scene 4: Human Context Mode

### Setup

This scene breaks the monotony and makes the demo memorable.

Teammate 4 is looking at a chat thread.

Someone messages:

> Sorry, I'm on my period and feel awful today.

Teammate 4 freezes.

They whisper to another teammate:

> Dude, what's a period?

The other teammate responds:

> I don't know, I don't talk to girls.

Teammate 4 panics slightly and hits the Clickthrough hotkey.

They ask:

> CT, what does that mean and what do I say?

### Clickthrough Behavior

CT creates a private, lightweight explanation overlay.

It should be funny because the teammate is clueless, but the product should stay respectful and useful.

Suggested generated sections:

- **Plain Explanation**
  - what a period is
  - why someone might feel bad
  - common symptoms
- **Visual Timeline**
  - simple menstrual cycle timeline
  - current period phase highlighted
- **What Not To Say**
  - avoid jokes
  - avoid minimizing it
  - do not ask invasive questions
- **Reply Drafts**
  - casual
  - supportive
  - short
- **Tone Slider**
  - normal friend
  - kind but not weird
  - very concise

Suggested reply:

> That sounds rough. No pressure to reply fast, hope you can take it easy today.

### Visual Moment

The generated UI is private, compact, and gentle.

It should not feel like a medical diagnosis tool. It should feel like social context plus basic educational help.

### Why This Wins

A chatbot could explain the topic.

Clickthrough generates a contextual response assistant directly where the user needs to respond.

This shows the web becoming a social-context surface.

## Demo Throughline

The recorded demo should keep returning to the same phrase:

> Clickthrough does not answer beside your browser. It changes the browser into the interface you needed.

Each scene proves a different part of the product:

| Scene | User Intent | Generated UI | Product Capability |
| --- | --- | --- | --- |
| Twitter/X | Verify | evidence dashboard | web investigation |
| PDF | Understand | visual explainer | contextual teaching |
| SharkAuth | Act | native action form | workflow abstraction |
| Chat | Respond | social-context assistant | human context |

## GenUI Primitive System

Clickthrough should be described as having reusable primitives the agent can compose at runtime.

Examples:

- `OverlayRoot`
- `PromptBar`
- `Panel`
- `Skeleton`
- `ClaimCard`
- `EvidenceSource`
- `ConfidenceMeter`
- `SourceTrail`
- `ContradictionList`
- `SequenceDiagram`
- `Timeline`
- `Stepper`
- `Toggle`
- `Form`
- `Field`
- `ScopeMatrix`
- `ApprovalGate`
- `ExecutionLog`
- `CopyField`
- `ReplyDraft`
- `ToneSlider`

The agent chooses which primitives are needed.

The renderer adapts them to the host page.

This is the difference between a chatbot and a generative interface system.

## Recording Structure

### Opening, 10-15 seconds

Show ordinary browser use.

Voiceover or caption:

> Websites make you navigate. Clickthrough lets you state intent.

### Scene 1, 45-60 seconds

Twitter/X verification.

This is the main hook.

### Scene 2, 30-45 seconds

OAuth PDF visual explanation.

This proves CT can generate interactive understanding, not just search.

### Scene 3, 45-60 seconds

SharkAuth action flow.

This proves CT can operate software through generated UI.

### Scene 4, 20-30 seconds

Funny social-context moment.

This proves CT is broad and makes the demo human.

### Closing, 10 seconds

Show the four generated overlays quickly.

End caption:

> Clickthrough: any page, any intent, the exact UI you need.

## One-Sentence Pitch

Clickthrough is a browser agent that generates runtime overlay interfaces for whatever the user is trying to verify, understand, or do on the current page.

## Short Description

Clickthrough pushes past the chat bubble by turning the current webpage into an intent-native interface. It observes the page, understands the user's request, searches or reasons when needed, and renders generated UI components directly over the page: evidence dashboards, visual explainers, action forms, approval gates, and response assistants. The result is not an answer beside the page. It is the missing interface, generated at runtime.

## What Must Be Obvious To Judges

- This is not a chatbot.
- The UI is generated at runtime.
- The overlay stays inside the current page.
- Each generated UI is different because each intent is different.
- The generated components adapt visually to the host page.
- The system handles verification, learning, action, and response.
- The SharkAuth scene proves this can execute real workflows, not just display information.

## Risks To Avoid

- Do not make the overlay look identical in every scene.
- Do not let the demo become a search-results summary.
- Do not spend too long explaining architecture during the recording.
- Do not make the social scene mean-spirited or creepy.
- Do not overpromise universal automation verbally. Show the moonshot through the demo.
- Do not call it a sidebar. It is an overlay interface layer.

## Best Final Framing

> Chatbots explain the maze.
>
> Clickthrough generates the door.

