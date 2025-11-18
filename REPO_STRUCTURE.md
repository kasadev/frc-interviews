# Repository Structure Guide

## Problem

We need to separate **candidate-facing materials** (code, PRD, README) from **interviewer-only materials** (solutions, rubrics, sample interviews).

Candidates should only see the interview project, not the answers or evaluation criteria.

---

## Recommended Solution: Two-Branch Strategy

### Branch Structure

```
main (candidate-facing)
├── Code & app files
├── README.md
├── PRD.md
└── package.json

interviewer-materials (interviewer-only)
├── All files from main
└── Additional interviewer files:
    ├── SOLUTIONS.md
    ├── EVALUATION_RUBRIC.md
    ├── EVALUATION_CHECKLIST.md
    ├── INTERVIEWER_SCRIPT.md
    ├── SAMPLE_INTERVIEW.md
    ├── FOLLOW_UP_QUESTIONS.md
    └── INTERVIEW_GUIDE.md
```

---

## Implementation Steps

### Step 1: Create Interviewer Branch

```bash
# Create new branch from main
git checkout -b interviewer-materials

# This branch will have everything (code + interviewer docs)
git push -u origin interviewer-materials
```

### Step 2: Remove Interviewer Materials from Main

```bash
# Switch back to main
git checkout main

# Remove interviewer-only files
git rm SOLUTIONS.md
git rm EVALUATION_RUBRIC.md
git rm EVALUATION_CHECKLIST.md
git rm INTERVIEWER_SCRIPT.md
git rm SAMPLE_INTERVIEW.md
git rm FOLLOW_UP_QUESTIONS.md
git rm INTERVIEW_GUIDE.md

# Commit removal
git commit -m "Move interviewer materials to separate branch"

# Push to main
git push origin main
```

### Step 3: Update .gitignore on Main

Add to `.gitignore` on main branch:

```
# Interviewer-only materials (kept in interviewer-materials branch)
SOLUTIONS.md
EVALUATION_RUBRIC.md
EVALUATION_CHECKLIST.md
INTERVIEWER_SCRIPT.md
SAMPLE_INTERVIEW.md
FOLLOW_UP_QUESTIONS.md
INTERVIEW_GUIDE.md
```

---

## Usage

### For Candidates

**Share main branch only:**

```
git clone https://github.com/kasadev/frc-interviews.git
```

They will only see:
- Code
- README.md
- PRD.md
- Tests (with intentional bugs)

They will NOT see:
- Solutions
- Evaluation materials
- Sample interview
- Scoring rubrics

---

### For Interviewers

**Clone interviewer branch:**

```bash
git clone https://github.com/kasadev/frc-interviews.git
cd frc-interviews
git checkout interviewer-materials
```

Or access via GitHub:
```
https://github.com/kasadev/frc-interviews/tree/interviewer-materials
```

---

## Maintaining Both Branches

### When Updating Code (Main Branch)

```bash
git checkout main
# Make changes to code, tests, etc.
git add .
git commit -m "Update booking validation logic"
git push origin main

# Merge changes into interviewer branch
git checkout interviewer-materials
git merge main
git push origin interviewer-materials
```

### When Updating Interviewer Materials

```bash
git checkout interviewer-materials
# Make changes to SOLUTIONS.md, rubrics, etc.
git add .
git commit -m "Update evaluation rubric"
git push origin interviewer-materials

# Do NOT merge these into main!
```

---

## Alternative: Separate Repository

If you prefer complete separation:

### Create Two Repos

**Repo 1: kasadev/frc-interviews** (candidate-facing)
- Only code and PRD
- Public or private
- Share with candidates

**Repo 2: kasadev/frc-interviews-internal** (interviewer-only)
- All interviewer materials
- Private only
- Internal team access only

**Pros:**
- Complete separation
- No risk of accidental exposure
- Can make candidate repo public

**Cons:**
- Need to maintain two repos
- Code changes must be synced manually
- More overhead

---

## Alternative: Private Directory (Not Recommended)

You could keep interviewer materials in a `/interviewer/` directory and add to `.gitignore`, but this is risky:

```
/interviewer/          # Not committed to repo
  ├── SOLUTIONS.md
  ├── RUBRIC.md
  └── ...
```

**Problems:**
- Easy to accidentally commit
- Not version controlled
- Hard to share with team
- Can't collaborate on improvements

**Don't use this approach.**

---

## GitHub Repository Settings

### Main Branch Protection

1. Go to Settings → Branches
2. Add rule for `main`
3. Enable:
   - ✅ Require pull request before merging
   - ✅ Require approvals (1+)
   - ✅ Do not allow bypassing

This prevents accidentally pushing interviewer materials to main.

### Interviewer Branch Access

1. Keep repo private
2. Only grant access to:
   - Hiring managers
   - Interview panel members
   - Engineering leadership

3. Share interviewer branch link only with authorized people:
   ```
   https://github.com/kasadev/frc-interviews/tree/interviewer-materials
   ```

---

## README Updates

### Update Main Branch README

Remove references to interviewer materials:

```markdown
# Rate Management Interview Project

A coding interview exercise for senior software engineers.

## Setup
...

## Tasks
See INTERVIEW_GUIDE.md for tasks

## Questions?
Contact the hiring team
```

### Interviewer Branch README

Add note at top:

```markdown
# Rate Management Interview Project - INTERVIEWER MATERIALS

⚠️ **CONFIDENTIAL - INTERVIEWER USE ONLY**

This branch contains solutions and evaluation materials. Do NOT share with candidates.

## Interviewer Resources

- [Solutions](SOLUTIONS.md) - Complete implementations
- [Evaluation Rubric](EVALUATION_RUBRIC.md) - Detailed scoring guide
- [Evaluation Checklist](EVALUATION_CHECKLIST.md) - Quick scoring form
- [Interviewer Script](INTERVIEWER_SCRIPT.md) - Word-for-word interview guide
- [Sample Interview](SAMPLE_INTERVIEW.md) - Complete example walkthrough
- [Follow-up Questions](FOLLOW_UP_QUESTIONS.md) - 28 probing questions
- [Interview Guide](INTERVIEW_GUIDE.md) - Complete interview playbook

## Candidate Resources
Switch to `main` branch to see candidate-facing materials.
```

---

## Recommended: Two-Branch Strategy

**We recommend the two-branch strategy** because:

✅ Simple to maintain
✅ Single source of truth for code
✅ Easy to update both
✅ Version controlled interviewer materials
✅ Low risk of accidental exposure
✅ Easy to share with team

---

## Implementation Checklist

- [ ] Create `interviewer-materials` branch
- [ ] Remove interviewer files from `main` branch
- [ ] Update `.gitignore` on `main`
- [ ] Add confidentiality notice to interviewer branch README
- [ ] Set up branch protection rules
- [ ] Document workflow in team wiki
- [ ] Share interviewer branch link with panel members
- [ ] Test: Clone main branch and verify no solutions visible

---

## Quick Commands

### Candidate Setup (Main Branch)
```bash
git clone https://github.com/kasadev/frc-interviews.git
cd frc-interviews
npm install
npm start
```

### Interviewer Setup (Interviewer Branch)
```bash
git clone https://github.com/kasadev/frc-interviews.git
cd frc-interviews
git checkout interviewer-materials
# Open INTERVIEWER_SCRIPT.md and EVALUATION_CHECKLIST.md
```

### Update Code (Sync to Both Branches)
```bash
# Update main
git checkout main
# ... make changes ...
git commit -m "Update code"
git push

# Sync to interviewer branch
git checkout interviewer-materials
git merge main
git push
```

### Update Interviewer Materials Only
```bash
git checkout interviewer-materials
# ... edit SOLUTIONS.md, etc ...
git commit -m "Update solutions"
git push
# Do NOT merge to main!
```

---

**Choose the two-branch strategy for best results.**
