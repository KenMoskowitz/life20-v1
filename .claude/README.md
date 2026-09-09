# Claude Code project config

## `hooks/pull-current-state.sh` — runs automatically on every prompt

Wired as a `UserPromptSubmit` hook in `settings.json`. Before Claude reads a
single file in this repo, it fetches from GitHub and prints the real state into
the session: current branch, whether it is behind `origin`, what is uncommitted,
what is sitting unmerged, and where the live deploy branch (`main`) actually is.

If the branch is cleanly behind, it fast-forwards it. That is the whole point —
no session should ever start by editing a stale copy.

It will **not** pull when:
- tracked files are modified (your edits are never touched)
- the branch has diverged from origin (needs a human decision)
- origin is unreachable (it says so and uses the last known state)

Untracked files do not block a pull; git refuses on its own if an incoming file
would clobber one.

Shared, not personal: this is committed, so any Claude session in this repo —
Ken's, MJ's, Laura's — gets the same guarantee. Put personal overrides in
`settings.local.json` (gitignored) instead of editing `settings.json`.

If the deploy branch ever changes, update `DEPLOY_BRANCH` at the top of the script.
