#!/bin/bash
# Runs on every prompt submitted in this project (UserPromptSubmit hook).
#
# Ken's rule: never operate on a stale repo. Before Claude reads a single file,
# this pulls the current state from GitHub and prints what it found, so the
# session is always working against what is actually on origin -- not whatever
# was true whenever the last session happened to end.
#
# Everything here is read-only or fast-forward-only. It never merges, never
# rebases, never stashes, never touches a dirty tree. If the repo is in a state
# that needs a human decision, it says so and gets out of the way.

set -uo pipefail

REPO="${CLAUDE_PROJECT_DIR:-$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")}"
cd "$REPO" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

DEPLOY_BRANCH="main"   # Vercel project life2-0 builds from this branch

# macOS ships no `timeout`, so roll one. A slow network must never stall a
# prompt, and a credential prompt must never hang the session invisibly --
# GIT_TERMINAL_PROMPT=0 makes git fail fast instead of waiting on a password.
capped() {
  local secs=$1; shift
  "$@" & local pid=$! waited=0
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$waited" -ge "$secs" ]; then
      kill -TERM "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; return 124
    fi
    sleep 1; waited=$((waited + 1))
  done
  wait "$pid"
}

FETCH_NOTE=""
if ! GIT_TERMINAL_PROMPT=0 capped 20 git fetch --prune --quiet origin 2>/dev/null; then
  FETCH_NOTE="could not reach origin (offline, slow, or auth); numbers below are from the last successful fetch"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
# Only *tracked* edits can be lost by a pull. Untracked files are left alone by
# a fast-forward, and git refuses on its own if an incoming file would clobber
# one -- so they get reported but do not block.
DIRTY_TRACKED=$(git status --porcelain --untracked-files=no | wc -l | tr -d ' ')

echo "== Repo state (auto-pulled at prompt time) =="
echo "branch: ${BRANCH}   deploys-from: ${DEPLOY_BRANCH}   uncommitted-files: ${DIRTY} (${DIRTY_TRACKED} tracked)"
[ -n "$FETCH_NOTE" ] && echo "warning: ${FETCH_NOTE}"

# Ahead/behind for the checked-out branch, and a fast-forward if it is safe.
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)
if [ -z "$UPSTREAM" ]; then
  echo "${BRANCH}: local only, no upstream on origin"
else
  read -r AHEAD BEHIND < <(git rev-list --left-right --count "${BRANCH}...${UPSTREAM}" | awk '{print $1, $2}')
  if [ "$BEHIND" -gt 0 ] && [ "$AHEAD" -eq 0 ] && [ "$DIRTY_TRACKED" -eq 0 ]; then
    if git merge --ff-only --quiet "$UPSTREAM" 2>/dev/null; then
      echo "${BRANCH}: pulled ${BEHIND} new commit(s) from ${UPSTREAM} -> now at $(git rev-parse --short HEAD)"
    else
      echo "${BRANCH}: ${BEHIND} behind ${UPSTREAM}, fast-forward refused (an incoming file likely collides with an untracked one) -- resolve before editing"
    fi
  elif [ "$BEHIND" -gt 0 ] && [ "$AHEAD" -gt 0 ]; then
    echo "${BRANCH}: DIVERGED from ${UPSTREAM} (${AHEAD} ahead, ${BEHIND} behind). Do not edit until this is reconciled."
  elif [ "$BEHIND" -gt 0 ]; then
    echo "${BRANCH}: ${BEHIND} behind ${UPSTREAM} but ${DIRTY_TRACKED} tracked file(s) are modified -- NOT pulled. Commit or stash first; local files are stale."
  elif [ "$AHEAD" -gt 0 ]; then
    echo "${BRANCH}: up to date with origin's history, ${AHEAD} commit(s) not yet pushed"
  else
    echo "${BRANCH}: in sync with ${UPSTREAM} ($(git rev-parse --short HEAD))"
  fi
fi

# The deploy branch matters even when it is not checked out: it is what the
# live site is actually running.
if [ "$BRANCH" != "$DEPLOY_BRANCH" ] && git rev-parse --verify --quiet "origin/${DEPLOY_BRANCH}" >/dev/null; then
  BEHIND_DEPLOY=$(git rev-list --count "HEAD..origin/${DEPLOY_BRANCH}")
  echo "origin/${DEPLOY_BRANCH} (live): $(git rev-parse --short "origin/${DEPLOY_BRANCH}") -- ${BEHIND_DEPLOY} commit(s) on it that ${BRANCH} does not have"
fi

# Unmerged work, so nothing gets quietly forgotten or duplicated.
UNMERGED=$(git branch -r --no-merged "origin/${DEPLOY_BRANCH}" 2>/dev/null \
  | sed 's|^ *origin/||' | grep -v '^HEAD' | grep -v "^${DEPLOY_BRANCH}$" | tr '\n' ' ')
[ -n "${UNMERGED// /}" ] && echo "unmerged branches on origin: ${UNMERGED}"

if [ "$DIRTY" -gt 0 ]; then
  echo "--- uncommitted changes ---"
  git status --porcelain | head -20
  [ "$DIRTY" -gt 20 ] && echo "... and $((DIRTY - 20)) more"
fi

exit 0
