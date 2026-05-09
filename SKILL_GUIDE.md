# Skill Guide for Clickthrough

> Quick reference for the team on how and when to use agent skills in this repo.

## How to Invoke a Skill

Use the **`skill`** tool with the `name` of the skill you want to load.

```
skill: { "name": "impeccable" }
```

Once loaded, the skill injects its instructions and workflows into the conversation context. You can then ask the agent to perform the task described by that skill.

**Rule of thumb:** If your request matches a skill's description, invoke it first. It provides domain-specific instructions, templates, and best practices that improve results significantly.

---

## Skill Catalog

### Design & Visual Quality

| Skill | Use When... |
|-------|-------------|
| **`impeccable`** | You want to design, redesign, critique, audit, polish, or improve any frontend interface (websites, dashboards, components, forms, onboarding). This is the broadest design skill. |
| **`frontend-design`** | Building web components, pages, artifacts, or applications from scratch. Generates creative, polished code that avoids generic AI aesthetics. |
| **`layout`** | The layout feels off, spacing is inconsistent, visual hierarchy is weak, or elements feel crowded/misaligned. |
| **`arrange`** | Similar to `layout` — fixes monotonous grids, inconsistent spacing, and weak visual rhythm. |
| **`typeset`** | Fonts look off, text hierarchy is unclear, sizes feel random, or readability needs improvement. |
| **`colorize`** | The UI looks gray, dull, too monochromatic, or lacks warmth and visual interest. |
| **`bolder`** | The design looks bland, generic, too safe, or lacks personality. Increases visual impact while keeping it usable. |
| **`quieter`** | The design is too loud, overwhelming, aggressive, or visually overstimulating. Tones it down while preserving quality. |
| **`polish`** | Final pre-ship quality pass — fix alignment, spacing, consistency, and micro-detail issues. |
| **`distill`** | The UI is too complex, noisy, or cluttered. Strip it to its essence. |

### Animation & Motion

| Skill | Use When... |
|-------|-------------|
| **`animate`** | Adding purposeful animations, transitions, micro-interactions, hover effects, or making the UI feel more alive. |
| **`overdrive`** | Pushing past conventional limits — shaders, spring physics, scroll-driven reveals, 60fps animations. Use when you want to wow. |
| **`delight`** | Adding moments of joy, personality, and unexpected touches that make interfaces memorable and enjoyable. |

### UX & Product

| Skill | Use When... |
|-------|-------------|
| **`shape`** | Planning the UX and UI for a feature *before* writing code. Runs a structured discovery interview and produces a design brief. |
| **`onboard`** | Designing or improving onboarding flows, empty states, and first-run experiences. |
| **`clarify`** | UX copy, error messages, labels, or instructions are confusing. Makes interfaces easier to understand. |
| **`copywriting`** | Writing or rewriting marketing copy for landing pages, pricing, feature pages, about pages, or product pages. |
| **`critique`** | Evaluating a design from a UX perspective — visual hierarchy, information architecture, emotional resonance, cognitive load. |

### Technical Quality

| Skill | Use When... |
|-------|-------------|
| **`audit`** | Running technical quality checks across accessibility, performance, theming, responsive design, and anti-patterns. Generates a scored report. |
| **`harden`** | Making interfaces production-ready — better error handling, i18n, text overflow, edge cases. |
| **`optimize`** | Diagnosing and fixing UI performance issues — loading speed, rendering, animations, images, bundle size. |
| **`security-auditor`** | Scanning for security vulnerabilities (OWASP Top 10, XSS, secrets exposure, auth issues). Run before deployments. |

### Systems & Consistency

| Skill | Use When... |
|-------|-------------|
| **`extract`** | Creating reusable components, refactoring repeated UI patterns, building a design system, or extracting design tokens. |
| **`normalize`** | Auditing and realigning UI to match existing design system standards, spacing, tokens, and patterns. |
| **`adapt`** | Making designs work across different screen sizes, devices, or platforms. Implements breakpoints and fluid layouts. |

### Communication Modes

| Skill | Use When... |
|-------|-------------|
| **`caveman`** | You need ultra-compressed communication to save tokens. The agent speaks like a caveman while keeping full technical accuracy. Intensity levels: `lite`, `full` (default), `ultra`, `wenyan-lite`, `wenyan-full`, `wenyan-ultra`. |

### Discovery

| Skill | Use When... |
|-------|-------------|
| **`find-skills`** | You're not sure which skill to use. The agent will help discover and recommend the right skill for your task. |
| **`ui-ux-pro-max`** | You need UI/UX design intelligence with access to 50+ styles, 161 color palettes, 57 font pairings, and 99 UX guidelines across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, HTML/CSS). |

### OpenSpec Workflow (Experimental)

These skills live in `.agents/skills/` and `.codex/skills/` and are used for the experimental OpenSpec change workflow:

| Skill | Use When... |
|-------|-------------|
| **`openspec-explore`** | Thinking through ideas, investigating problems, or clarifying requirements before starting a change. |
| **`openspec-propose`** | Quickly describing what you want to build and getting a complete proposal with design, specs, and tasks. |
| **`openspec-apply-change`** | Implementing tasks from an OpenSpec change. |
| **`openspec-archive-change`** | Finalizing and archiving a completed change in the experimental workflow. |

### One-Time Setup

| Skill | Use When... |
|-------|-------------|
| **`teach-impeccable`** | One-time setup to gather design context for the project and save it to the AI config file. Run once to establish persistent design guidelines. |

---

## Common Workflows

### Starting a New Feature
1. **`shape`** — Plan the UX/UI and get a design brief.
2. **`frontend-design`** or **`impeccable`** — Build the initial interface.
3. **`audit`** — Check accessibility and performance early.

### Improving an Existing Screen
1. **`critique`** — Evaluate what's wrong.
2. **`layout`** / **`typeset`** / **`colorize`** — Fix specific visual issues.
3. **`polish`** — Final quality pass before shipping.

### Refactoring UI Patterns
1. **`extract`** — Pull out reusable components and tokens.
2. **`normalize`** — Ensure everything aligns with the new system.
3. **`harden`** — Add error states and edge case handling.

### Pre-Ship Checklist
1. **`audit`** — Technical quality check.
2. **`security-auditor`** — Security scan.
3. **`polish`** — Micro-detail fixes.

---

## Tips

- **Stack skills:** You can invoke multiple skills in a single task. For example, load `impeccable` then ask for a `polish` pass.
- **Be specific:** Skills work best when you describe the problem clearly (e.g., "this card layout feels crowded" vs. "fix this").
- **Don't overthink:** If you're unsure which skill fits, use **`find-skills`** or just describe the problem — the agent can suggest the right one.
- **Project context:** This is the **Clickthrough** repo. We build runtime overlay UIs, not chatbots. Keep that in mind when using design skills — the product is the generated interface itself.
