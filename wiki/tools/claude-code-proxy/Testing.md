# Testing

Use this page to verify an install, a provider setup, or a code change.

## User Smoke Test

```sh
ccproxy doctor
ccproxy model current
ccproxy run -- -p "reply ccproxy-ok"
```

Expected result: Claude Code runs through the local proxy and replies with
`ccproxy-ok`.

## Real Claude Code Smoke

```sh
ccproxy test --profile custom --claude
```

This starts the proxy, launches the real Claude Code CLI path, and checks for
the expected output.

## Mock Provider Test

From one terminal:

```sh
python scripts/mock_openai_provider.py --port 8000
```

From another terminal:

```sh
ccproxy model set --provider custom --model custom-big
ccproxy run -- -p "reply ccproxy-ok"
```

## Maintainer Verification

```sh
python -m unittest discover -s tests
python -m compileall src tests scripts
git diff --check
```

Run provider-specific real tests only when the matching API key or adapter is
available.

## What To Check After Runtime Changes

| Area | Why it matters |
| --- | --- |
| Normal `ccproxy run` | Confirms the user-facing command works. |
| `--bare` smoke path | Confirms the minimal Claude Code path still works. |
| Tool calls | Confirms Claude Code tools are not broken by streaming translation. |
| Wrapper scripts | Confirms Windows and Unix helpers do not regress. |
| README and wiki | Confirms the public commands match the actual CLI. |
