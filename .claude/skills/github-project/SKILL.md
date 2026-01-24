---
name: github-project
description: Manage GitHub issues, PRs, and project boards. Triggers on "create issue", "update issue", "list issues", "check PR", "start issue", "work on issue".
---

# GitHub Project Management

Manage issues, pull requests, and project boards using the GitHub CLI (`gh`).

## When to Use

- User asks to create, update, or view issues
- User wants to check PR status or create a PR
- User references an issue number (e.g., "issue #9")
- **When starting work on an issue** → interview user, create plan, then move to "In Progress"
- **After pushing code for an issue** → offer to move to "Done"
- After completing work that should be tracked in an issue
- When planning work that should be captured as issues

## IMPORTANT: Working on Issues

When the user asks to "work on issue #X" or "start issue #X", **ALWAYS**:
1. Read the issue details first
2. Interview the user to clarify requirements
3. Enter plan mode and get approval
4. Only then begin implementation

Never skip the interview and planning steps.

## Common Commands

### Issues

```bash
# Create issue
gh issue create --title "Title" --body "Description"

# View issue
gh issue view 9

# List issues
gh issue list
gh issue list --state open
gh issue list --label "bug"

# Edit issue body
gh issue edit 9 --body "New body"

# Add to issue (append via edit or comment)
gh issue comment 9 --body "Additional note"

# Close issue
gh issue close 9

# Reopen issue
gh issue reopen 9

# Add labels
gh issue edit 9 --add-label "enhancement"
```

### Pull Requests

```bash
# Create PR
gh pr create --title "Title" --body "Description"

# View PR
gh pr view 123

# List PRs
gh pr list

# Check PR status/checks
gh pr checks 123

# Merge PR
gh pr merge 123
```

### Project Boards

```bash
# List projects
gh project list

# View project items
gh project item-list <project-number>

# Get project field IDs (needed for status updates)
gh project field-list <project-number> --owner @me --format json

# Get item ID for an issue
gh project item-list <project-number> --owner @me --format json | jq '.items[] | select(.content.number == <issue-number>) | .id'

# Move issue to "In Progress"
gh project item-edit --project-id <project-id> --id <item-id> --field-id <status-field-id> --single-select-option-id <in-progress-option-id>

# Move issue to "Done"
gh project item-edit --project-id <project-id> --id <item-id> --field-id <status-field-id> --single-select-option-id <done-option-id>
```

## Issue Body Formatting

Use heredoc for multi-line bodies with proper formatting:

```bash
gh issue create --title "Feature title" --body "$(cat <<'EOF'
Brief description of the feature.

## Goals
- Goal 1
- Goal 2

## Approach
Details here.

## Related
- Issue #X
- ADR-NNN
EOF
)"
```

## Linking Related Items

When creating issues, reference related items:
- Other issues: `#9`, `Issue #9`
- ADRs: `ADR-003: Title`
- Files: backtick paths like \`docs/specs/file.md\`

## Workflow Automation

### Starting Work on an Issue

When working on an issue, **ALWAYS follow this flow**:

#### 1. Read the Issue
```bash
gh issue view <ISSUE_NUMBER>
```

#### 2. Interview the User

Before any implementation, conduct a brief interview to clarify requirements:

**Questions to ask** (use AskUserQuestion):
- **Scope**: "What's the minimum viable solution for this issue?"
- **Constraints**: "Are there any technical constraints or preferences?"
- **Dependencies**: "Does this depend on or affect other issues?"
- **Acceptance**: "How will we know this is done?"

Adapt questions based on issue type:
- **Bug**: "Can you reproduce it? What's the expected behavior?"
- **Feature**: "What's the core functionality vs nice-to-haves?"
- **Refactor**: "What pain points should this address?"

#### 3. Create an Implementation Plan

After the interview, **enter plan mode** to design the approach:

1. Use `EnterPlanMode` to switch to planning
2. Explore the relevant codebase areas
3. Write a concrete implementation plan with:
   - Files to modify/create
   - Key changes in each file
   - Testing approach
   - Potential risks or edge cases
4. Get user approval via `ExitPlanMode`

#### 4. Move to "In Progress"

Only after plan approval, move the issue:

```bash
# Get item ID
gh project item-list 2 --owner @me --format json | jq -r '.items[] | select(.content.number == <ISSUE_NUMBER>) | .id'

# Update status
gh project item-edit \
  --project-id PVT_kwHODx2xTM4BNJ9E \
  --id <ITEM_ID> \
  --field-id PVTSSF_lAHODx2xTM4BNJ9Ezg8O5KQ \
  --single-select-option-id 47fc9ee4
```

#### 5. Implement Following the Plan

Execute the approved plan, updating todos as you progress.

### After Pushing Code

After pushing code that addresses an issue, **offer to move it to "Done"**:

1. Ask the user: "I've pushed the changes for issue #X. Would you like me to move it to Done?"

2. If yes, update status:
```bash
gh project item-edit \
  --project-id PVT_kwHODx2xTM4BNJ9E \
  --id <ITEM_ID> \
  --field-id PVTSSF_lAHODx2xTM4BNJ9Ezg8O5KQ \
  --single-select-option-id 98236657
```

### Status Option IDs

| Status | Option ID |
|--------|-----------|
| Todo | f75ad846 |
| In Progress | 47fc9ee4 |
| Done | 98236657 |
| Canceled | 4fb81b35 |

## After Implementation

When work is completed that relates to an issue:
1. Offer to move the issue to "Done" on the project board
2. Offer to close the issue if fully resolved
3. Or add a comment noting progress
4. Reference the commit or PR that addresses it

## Proactive Suggestions

When appropriate, suggest:
- Creating issues for discovered bugs or improvements
- Breaking large tasks into multiple issues
- Adding labels or milestones
- Linking related issues together
