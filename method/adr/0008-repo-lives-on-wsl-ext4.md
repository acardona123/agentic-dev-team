# 0008 — The working copy lives on the WSL2 Linux filesystem, not on /mnt/c
**Status:** Accepted · **Date:** 2026-08-25  
**Scope:** project — A WSL2 environment fact, not a method decision.

## Context
The repo was originally checked out at `C:\Users\alexc\Documents\agentic_app`, which
WSL2 exposes to Linux as `/mnt/c/...` over the **9p** protocol.

S0's AC4 (edit a string, watch the phone update) failed. The cause is not Expo:
9p does not deliver inotify file-change events into WSL. Metro watches the source
tree with Node's `fs.watch`; on 9p that watcher simply never fires, so Metro never
learns a file was saved, never rebuilds, and never pushes an update to the phone.
Fast Refresh was not broken — it was never triggered.

Measured directly, same machine, same code:

| | `fs.watch` on save | `npm test` |
|---|---|---|
| `/mnt/c` (9p) | **no event** | 26 s |
| `~` (ext4) | fires immediately | 1.6 s |

The 15x build-time difference is the same root cause: every file read crosses the
9p boundary.

## Decision
The working copy lives at **`~/agentic_app`** on ext4. The Windows path is retained
only as a signpost: `C:\Users\alexc\Documents\agentic_app` now holds a `README-MOVED.md`
and two `.bat` shortcuts, no code.

Windows reaches the repo at `\\wsl.localhost\Ubuntu\home\alexcardona\agentic_app`.
VS Code must open it through the WSL remote, not through the `C:` drive.

**The constraint, stated once so no future session re-derives it:**
> Never move, clone, or copy this repo onto `/mnt/c`, `/mnt/d`, or any drvfs mount,
> and never run Metro, jest, or `npm install` against a checkout that lives there.
> A tree under `/mnt/` silently loses file watching. The symptom is not an error —
> it is a save that does nothing, which costs far more to diagnose than to avoid.

## Consequences
- Fast Refresh works, so AC4 is testable at all.
- Everything that reads the tree gets several times faster.
- Editing the files from Windows applications is no longer the default path; VS Code
  connects via the WSL remote instead. This is the intended trade.
- `node_modules` was reinstalled on ext4 rather than copied; a tree built on 9p is
  not worth carrying across.

## Alternatives rejected
- **Metro polling on `/mnt/c`.** Keeps the Windows path, but replaces event-driven
  watching with a timer that continuously rescans a slow filesystem — it burns CPU
  forever to work around a filesystem we had no reason to keep.
- **A symlink at the Windows path.** A Linux symlink to `/home/...` is meaningless to
  Windows Explorer, which cannot resolve it. The `\\wsl.localhost` UNC path is the
  only pointer both sides understand, hence the `.bat` shortcuts.
