#!/usr/bin/env bash
# PreToolUse hook: block grep/rg when it looks like a symbol search.
# Tells the agent to use LSP instead.
#
# DISABLED BY DEFAULT — enable by moving the "_disabled_until_lsp_verified"
# block in .claude/settings.json into the active "hooks" key.
#
# Requires: jq (brew install jq)

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

if [[ "$tool_name" != "Bash" ]]; then
  exit 0
fi

# Heuristic: rg/grep called with a quoted identifier-like pattern.
# Matches: rg -n "ScanJobDetail" / grep "useAuth" / rg "MyClass" .
# Tune the regex to your repo's actual bad patterns.
if echo "$command" | grep -qE '(^|[[:space:]])(rg|grep)[[:space:]].*"[A-Za-z_][A-Za-z0-9_]+"'; then
  cat <<'EOF' >&2
BLOCKED: This looks like a symbol search via grep. Use LSP instead:
  - goToDefinition for definitions
  - findReferences for usages
  - workspaceSymbol to locate a symbol anywhere in the project
If LSP is genuinely unavailable, state that and explicitly opt to retry with grep.
EOF
  exit 2
fi

exit 0
