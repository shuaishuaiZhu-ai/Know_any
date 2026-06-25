---
type: index
title: "AI Projects"
created: 2026-06-25
updated: 2026-06-25
tags: [ai, projects, index]
status: active
---

# AI Projects

Use this area when AI-facing knowledge is easier to retrieve by project name than by content type. This is an optional routing mode, not a replacement for `tools/`, `bugs/`, `workflows/`, or `reflections/`.

## When To Use Project Split

Choose `projects/<project>/` when:

- one project has its own tools, bugs, workflows, credentials notes, and retrospectives;
- the project name is the most likely search key for another AI agent;
- mixing the material into global `tools/` or `bugs/` would hide important local context;
- the same page would otherwise need many project-specific caveats.

Keep content in the type-based folders when it is reusable across projects.

## Folder Contract

Each project may use this shape:

```text
projects/<project>/
|-- index.md       # required if the project folder exists
|-- tools.md       # optional project-local commands and tools
|-- bugs.md        # optional solved bugs and debugging playbooks
|-- workflows.md   # optional handoff and operating rules
`-- reflections.md # optional project-specific retrospectives
```

Use one canonical page for each topic. If a project topic is also useful globally, link to it from `tools/`, `bugs/`, or `workflows/` instead of copying the whole page.

## Project Index

No project-specific AI folders have been created yet. Add rows here when the first `projects/<project>/index.md` page is created.

| Project | Entry | Scope |
|---|---|---|
| _none yet_ | - | Create the first project folder only when there is real project-scoped AI knowledge to preserve. |
