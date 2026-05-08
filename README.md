# Clickthrough

**Generative UI for the existing web.**

Clickthrough is an agentic browser layer that reads the current page, understands the DOM, remembers how you like to operate software, and generates the exact interface you need to complete a task.

Instead of forcing humans to click through tabs, modals, filters, settings, and broken dashboards, Clickthrough turns any web app into an action surface.

You describe what you want.

Clickthrough generates the UI.

You approve.

It acts.

Then it remembers what worked.

---

## The problem

Modern software is powerful, but the interface is getting worse.

Every SaaS product has its own maze:

- nested dashboards
- hidden settings
- confusing filters
- destructive actions
- inconsistent buttons
- endless modals
- workflows that require too many clicks

AI copilots usually sit beside the product and tell you what to do.

That is not enough.

The agent should not explain the maze.

The agent should generate the missing interface.

---

## What Clickthrough does

Clickthrough is a browser agent that lives on top of the page you are using.

It can:

- inspect the visible DOM
- understand available actions
- remember site-specific workflows
- recall user preferences and nitpicks
- generate task-specific mini UIs
- execute browser actions after approval
- verify the result
- save what worked for next time

The core loop:

```txt
Observe → Recall → Plan → Generate UI → Ask Approval → Act → Verify → Remember
