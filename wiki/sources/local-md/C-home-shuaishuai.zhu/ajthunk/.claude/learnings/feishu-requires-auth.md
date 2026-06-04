---
created: 2026-03-30
last_updated: 2026-03-30
source_session: 2026-03-30-1935
tags: [feishu, authentication, agent-browser, browser-automation]
---

# Feishu Documents Require Authentication

## Problem
Feishu (飞书) documents redirect to login page even with agent-browser.
WebFetch cannot access them at all.

## Options
1. User pastes document content manually — fastest
2. User logs in interactively via agent-browser (scan QR code)
3. Set document to public access in Feishu settings

## Preferred Approach
Ask user to paste content directly when document content is needed.
