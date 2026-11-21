# agent-starter

## CI: run gates locally, never on GitHub Actions

_Set by Ale 2026-11-20. Applies to every agent and every session in this repo._

- **Do not use GitHub Actions.** Don't trigger, re-run, wait on or add Actions workflows, and
  don't treat a missing or red Actions check as a blocker. Actions is blocked on this account.
- **Run the gates locally before every commit you push or PR you merge:** install, lint,
  typecheck, tests and build — whichever this repo has. Find them in the package scripts
  (`package.json`, `Makefile`, `pyproject.toml`) and in `.github/workflows/*.yml`, which
  remain the reference for what each gate runs; run those same commands yourself.
- **Report the results you saw:** say which gate commands ran and whether they passed, in
  the PR description or the final message. A gate you couldn't run is reported as not run,
  with the reason — never as passed.
- **Deploys and scheduled jobs** that a workflow used to run are done locally with the same
  commands (e.g. `wrangler deploy`), and only when the task calls for it.
