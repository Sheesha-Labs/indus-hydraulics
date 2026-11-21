#!/usr/bin/env bash
# Block a pull request that would publish a supplier or principal name.
#
# The repository is public (CLAUDE.md §14). The denylist itself is secret: it is
# the GitHub Actions secret SUPPLIER_DENYLIST (one case-insensitive extended
# regex per line), the same file as ~/.config/indus/supplier-denylist.txt.
#
# Checks the PR diff, every PR commit message, and the PR title, body and head
# branch name. Never prints a match: grep runs with -q, and a hit reports only
# WHERE it is (a file name, a commit, "PR title"), because Actions logs are public
# too.
#
#   BASE_REF=main PR_TITLE=… PR_BODY=… PR_HEAD=… SUPPLIER_DENYLIST=… scripts/ci/leak-guard.sh
set -uo pipefail

if [ -z "${SUPPLIER_DENYLIST:-}" ]; then
  echo "::error::SUPPLIER_DENYLIST is empty. An empty denylist would pass everything."
  exit 1
fi

list="$(mktemp)"
trap 'rm -f "$list"' EXIT
printf '%s\n' "$SUPPLIER_DENYLIST" | grep -v '^[[:space:]]*$' > "$list"

base="origin/${BASE_REF:-main}"
hits=0
hit() { echo "::error title=Denylisted term::found in $1 (the term is not printed)"; hits=$((hits + 1)); }

# Added lines of each changed file.
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if git diff "$base"...HEAD -- "$file" | grep '^+' | grep -v '^+++' | grep -qiEf "$list"; then
    hit "file $file"
  fi
done < <(git diff --name-only "$base"...HEAD)

# Every commit message on the branch.
while IFS= read -r sha; do
  [ -z "$sha" ] && continue
  if git log -1 --format=%B "$sha" | grep -qiEf "$list"; then
    hit "commit message ${sha:0:12}"
  fi
done < <(git rev-list "$base"..HEAD)

# PR metadata, passed in through the environment (never interpolated).
printf '%s' "${PR_TITLE:-}" | grep -qiEf "$list" && hit "PR title"
printf '%s' "${PR_BODY:-}" | grep -qiEf "$list" && hit "PR body"
printf '%s' "${PR_HEAD:-}" | grep -qiEf "$list" && hit "branch name"

if [ "$hits" -gt 0 ]; then
  echo "Remove the term from each place listed, rewriting commits that carry it, then push again."
  exit 1
fi
echo "leak guard: clean"
