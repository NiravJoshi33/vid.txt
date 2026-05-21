---
name: code-navigation
description: |
  Navigate code by symbol — find definitions, references, implementations,
  type signatures. Use this skill for ANY task that involves locating a
  symbol (function, class, type, variable, interface) in the codebase.
  Use BEFORE grep/Bash search.
---

# Code Navigation Protocol

## You MUST use LSP. grep is a fallback, not a default.

When the user asks about a symbol — where it's defined, where it's used, what implements it, what its type is — your FIRST action is an LSP call.

## Decision table

| User question                          | First tool                |
| -------------------------------------- | ------------------------- |
| Where is `foo` defined?                | `goToDefinition`          |
| Where is `foo` used / called?          | `findReferences`          |
| What implements interface `Bar`?       | `goToImplementation`      |
| What's the type of `foo`?              | `hover`                   |
| List symbols in `path/to/file.ts`      | `documentSymbol`          |
| Find `foo` anywhere in the project     | `workspaceSymbol`         |
| What calls `foo`?                      | `callHierarchy` (incoming)|

## Fallback policy

If LSP fails with "Executable not found" or returns no results:
1. State the failure explicitly: "LSP is unavailable, falling back to grep."
2. Only then use grep.
3. Do NOT silently skip LSP. Do NOT use grep first "just to check."

## After every edit

Run `getDiagnostics` on the file you touched. If there are errors, fix them in the same turn — do not wait for `tsc`, tests, or the user to notice.

## Before any refactor

Run `findReferences` on the symbol you're about to change. Map every callsite before you touch it. If you don't know all callsites, you don't know what you're breaking.
