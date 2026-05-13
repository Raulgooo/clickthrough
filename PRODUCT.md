# Product

## Register

product

## Users

Clickthrough is for anyone using a computer who hits uncertainty, confusion, or workflow friction in the current app, page, document, or desktop surface.

The first demo audience is engineers, builders, and power users who live in complex web tools, verify information, read technical material, and move across dashboards all day. The broader product should still feel accessible to non-technical people who simply want the web to respond to intent instead of forcing navigation.

Users arrive mid-flow. They are reading, comparing, learning, replying, designing, debugging, editing, or trying to get something done. They do not want to leave the current surface, open another assistant, or learn a new app.

## Product Purpose

Clickthrough is a runtime interface layer for the computer. It observes the current browser or OS context, understands the user's point of intent, and generates the exact overlay UI needed to verify, understand, navigate, compose, decide, or act.

It exists to replace navigation friction with generated, context-aware interfaces. Instead of explaining what to click, Clickthrough creates the missing control surface on top of the current page, app, document, image, video frame, or workflow.

Clickthrough should be proactive by default and action-capable by permission. It may observe, explain, verify, summarize, draft, highlight, and prepare next steps without taking over. Browser mutation, credential creation, posting, deleting, buying, and permission changes require explicit approval, verified targets, and result verification.

Success looks like the computer briefly becoming intent-native: CT appears near the cursor, selection, hover target, or focused control, then expands into the interface that should have existed.

The browser is the first runtime. The deeper product thesis is that the pointer becomes an intent surface across the OS.

## Brand Personality

Precise, adaptive, quietly powerful.

Clickthrough should feel like expert browser infrastructure: sharp, reliable, fast, and context-aware. It should not feel like a loud AI toy, a generic copilot bubble, or a decorative assistant.

The tone is calm and direct. It should earn trust through visible evidence, clear controls, careful approval gates, and honest uncertainty.

## Anti-references

Clickthrough should not look or feel like:

- a chatbot sidebar
- a generic SaaS landing page
- a neon AI assistant
- a glassmorphism overlay
- a decorative dashboard skin
- a repeated card grid
- an "AI wrapper" around search results
- a separate app that pulls the user away from the current page
- an always-on desktop surveillance assistant
- an animated mascot that interrupts globally
- a raw computer-control agent without visible permission boundaries

Avoid designs where the same panel appears on every site. The core product promise is that UI changes shape based on page context and user intent.

## Design Principles

### Stay On The Page

Clickthrough should never make the user leave the current context unless the task explicitly requires it. The overlay appears where the user's attention already is.

### Follow Intent Across Surfaces

The pointer, selection, focus, active window, screenshot region, and recent user action are all intent signals. Clickthrough should follow those anchors across browser pages first and OS surfaces next, scoped by permission and user engagement.

### Generate The Missing Interface

The answer is not a paragraph when the user needs a dashboard, diagram, form, approval gate, or action surface. The agent should render the interface that fits the intent.

### Adapt Without Disappearing

Generated UI should borrow the host page's visual language, but remain recognizably Clickthrough-controlled. Sensitive actions, approval gates, and uncertainty states must stay clearly marked.

### Show Work As UI

Progress, evidence, tool use, uncertainty, action steps, and verification should appear as interface state. The user should see the overlay assemble as the agent works.

### Approval Before Impact

Clickthrough may investigate and explain freely. Any external send, account change, credential creation, permission change, or destructive action requires clear user approval and result verification.

## Accessibility & Inclusion

No additional formal requirement beyond a strong default accessibility baseline.

Target WCAG AA for generated overlays:

- keyboard-accessible controls
- visible focus states
- reduced-motion support
- sufficient contrast
- no reliance on color alone for status, risk, confidence, or verdict
- screen-reader labels for icon-only actions
- text alternatives for diagrams and generated visual explainers
