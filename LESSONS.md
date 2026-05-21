# LESSONS.md

Personal knowledge base. Things I've learned working with AI agents that aren't yet (or aren't ever) worth promoting into `CLAUDE.md`.

**Promotion rule:** If a lesson here proves itself across 2+ projects, promote it into `CLAUDE.md` and note the promotion in `CHANGELOG.md`.

**Pruning rule:** If a lesson here is older than 6 months and you haven't referenced it, delete it.

---

## Format

```
## YYYY-MM-DD — short title
**Context:** what was happening
**Mistake:** what the agent did wrong (or what you did wrong)
**Lesson:** the rule that would have helped
**Status:** [not promoted | promoted to CLAUDE.md | stack-specific | retired]
```

---

## 2026-05-19 — Don't trust "LSP is installed" — verify it actually responds

**Context:** Set up `ENABLE_LSP_TOOL=1`, installed the marketplace plugin, expected LSP to "just work."
**Mistake:** The plugin loaded but the actual `typescript-language-server` binary wasn't on the VS Code-spawned shell's PATH. Agent silently fell back to grep. I didn't notice for a few sessions.
**Lesson:** After any LSP setup, run `/lsp` in Claude Code AND ask the agent to do one `goToDefinition` smoke test. If you see `LSP` in the tool trace, you're good. If you only see `Bash rg`, LSP is broken even if it's "installed."
**Status:** not promoted — verification is a one-time setup thing, doesn't belong in the rules file.

---

## (Add new entries here)
