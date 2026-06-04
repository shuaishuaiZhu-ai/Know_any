---
created: 2026-04-08
last_updated: 2026-04-08
source_session: 5d38a655
tags: [plan-mode, copilot-chat, detection, architecture, root-cause]
---

# Plan Mode Detection Failure — Copilot Chat Agent Handoff Limitation

## Problem
User selects "Plan mode" in VS Code Copilot Chat UI, but Claude Code never receives the plan mode state. No `Plan mode is active` system reminder is injected.

## Root Cause (Corrected)
Copilot Chat's "Plan mode" dropdown is a **Copilot-native UI concept**. When using Claude through Copilot Chat's agent handoff mechanism (`Claude` agent), the plan mode state is **not propagated** to the Claude Code backend.

This is an architectural limitation, **not a version-specific bug**:
- Copilot Chat 0.42.3: Plan mode NOT passed to Claude agent
- Copilot Chat 0.43.0: Plan mode NOT passed to Claude agent (0.43.0 additionally routes to built-in Plan Agent, but even without that, the state wouldn't reach Claude)

Evidence from logs:
- Path: Copilot Chat UI → `[Claude Copilot Proxy]` → Claude Code
- `[ClaudeLanguageModelServer]` runs on localhost as a bridge
- No plan mode metadata in the handoff

### Previous incorrect diagnosis
Previously blamed Copilot Chat 0.43.0 adding `"plan"` to agent type array. While 0.43.0 did add a built-in Plan Agent interceptor, downgrading to 0.42.3 confirmed the plan mode state was never transmitted to Claude in either version.

## Solution
User should **ignore the Copilot Chat Plan mode dropdown** and instead type "use plan mode" or similar in the chat message. Claude will then call `EnterPlanMode` based on the user's textual declaration.

## Detection Rule
When `Plan mode is active` marker is absent from system reminders:
- Do NOT assert "edit mode" — the marker injection is known to not work via Copilot Chat
- User's explicit declaration in text is the highest-priority signal
- If user says "use plan mode", immediately call `EnterPlanMode`
