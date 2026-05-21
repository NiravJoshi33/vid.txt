# .agents/

Async communication folder for multi-agent workflows (e.g. Claude Code implementing while Codex reviews).

The filesystem is the group chat. Agents don't talk to each other directly — they read and write to shared markdown files, and a human (you) nudges each side to "check your inbox."

## Folder shape

```
.agents/
├── inbox/
│   ├── for-implementer.md  — reviewer → implementer feedback
│   └── for-reviewer.md     — implementer → reviewer summaries
└── log.md                   — append-only running log of handoffs
```

## How to wire it up

In **Claude Code**, prompt the implementer agent something like:

> You are the IMPLEMENTER. After every change, write a short summary of
> what you did, what you didn't, and any open questions to
> `.agents/inbox/for-reviewer.md` (overwrite). Append a one-line entry
> to `.agents/log.md` with the timestamp. Then wait.

In **Codex**, prompt the reviewer:

> You are the REVIEWER. Read `.agents/inbox/for-reviewer.md`. Review the
> implementer's work against `CLAUDE.md`, the relevant spec in `docs/specs/`,
> and the diff. Write feedback to `.agents/inbox/for-implementer.md`
> (overwrite). Append a one-line entry to `.agents/log.md`.

Then you alt-tab between them and say "check your inbox" to drive the loop.

## When this is worth it

- Multi-hour tasks where review-as-you-go catches drift early
- Architectural changes where a second opinion is valuable
- Any task where the spec is non-trivial enough that one agent might lose the thread

For small tasks, this is overkill — just use one agent.
