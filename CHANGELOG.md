# Template Changelog

Append-only log of changes to this template. Each entry says **what** changed and **what failure it prevents**. If you can't articulate the failure, the rule probably doesn't belong here.

Format:
```
## YYYY-MM-DD
### Added / Changed / Removed
- <Rule or section>. **Prevents:** <the specific mistake the agent was making>.
```

---

## 2026-05-19
### Added (initial template)
- **Non-negotiable rules block** at top of CLAUDE.md. **Prevents:** agent drifting on the rules that matter most (plan-first, no surprise dependencies, no scope creep). Strong language (MUST/NEVER) is empirically what gets followed.
- **LSP-first navigation block.** **Prevents:** agent grepping for symbols when LSP would be faster and more accurate. Saw this repeatedly in bugbuzzer — agent grepped 4-6 times for `ScanJobDetail` instead of one `goToDefinition` call. Each grep loads files into context that shouldn't be there.
- **Documentation index inside CLAUDE.md.** **Prevents:** agent reading every ADR / spec / old plan "just to check," polluting context. Index gives each doc a trigger condition and marks `docs/archive/` as DO NOT READ.
- **Architectural philosophy section.** **Prevents:** agent introducing speculative complexity, second pattern for an existing problem, refactoring working code.
- **"What to do when stuck" section.** **Prevents:** agent looping on the same error with cosmetic variations, swallowing exceptions, disabling tests, mocking production code.
- **Project-specific context block** at the bottom. **Prevents:** "match existing style" being meaningless because the agent doesn't know what the existing style is.
- **code-navigation skill** in `.claude/skills/`. **Prevents:** LSP-first rule getting diluted in the main CLAUDE.md. Skill re-emphasizes the rule specifically when navigation tasks come up.
- **`.agents/` folder** for async comms. **Prevents:** ad-hoc handoffs between Claude Code and Codex sessions getting lost; gives multi-agent review a shape.
- **LESSONS.md** at root. **Prevents:** CLAUDE.md bloat. New learnings go here first; promote to CLAUDE.md only when they prove out.
