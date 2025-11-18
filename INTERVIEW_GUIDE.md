# SpaceRate Pro - Interview Guide

## Overview

This is a three-part technical interview designed to assess a senior software engineer's practical skills in:
- Code comprehension and system understanding
- Feature implementation and business logic
- Code quality analysis using AI tools
- Problem-solving in a realistic domain (hospitality space rates)

**Time Allocation:**
- Part 1: 15-20 minutes (Setup & Exploration)
- Part 2: 60-75 minutes (Implementation)
- Part 3: 15-20 minutes (AI-Assisted Code Review)

**Total Time:** ~2 hours

---

## Pre-Interview Setup (For Interviewer)

1. Ensure the repository is accessible to the candidate
2. Confirm candidate has:
   - Node.js v18+ installed
   - A code editor (VS Code recommended)
   - Access to AI tools (ChatGPT, Claude, or similar)
3. Send candidate the repository link 10 minutes before interview
4. Have the PRD.md and README.md ready for reference

---

## Part 1: Setup & Code Exploration (15-20 minutes)

### Objective
Assess the candidate's ability to:
- Quickly set up a development environment
- Read and understand product requirements
- Navigate an unfamiliar codebase
- Identify data and system issues

### Instructions for Candidate

> "We're going to work with SpaceRate Pro, a rate management system for hospitality spaces. First, please:
>
> 1. Clone the repository and set it up locally
> 2. Read through the PRD.md to understand the business domain
> 3. Start the application and verify it's running
> 4. Explore the codebase structure
> 5. Test the existing API endpoints
> 6. Review the seed data and identify any data quality issues"

### What to Observe

**Good Signs:**
- Candidate reads README.md first for setup instructions
- Successfully installs dependencies and starts server within 5 minutes
- Uses curl/Postman/Insomnia to test endpoints systematically
- Reviews both code and data files
- Asks clarifying questions about the business domain
- Identifies missing rates and data issues in seed data

**Red Flags:**
- Struggles with basic npm commands
- Doesn't read documentation before asking questions
- Randomly navigates code without purpose
- Doesn't test the running application

### Expected Findings

Candidates should discover:
1. **Missing Rates:**
   - Executive Office: Missing Q2 rates (April-June)
   - Meeting Room Large: No rates at all
   - Collaboration Space: Missing H2 rates (July-December)

2. **Data Quality Issues:**
   - Private Office (Tech Campus): Overlapping rate date ranges

3. **Code Structure:**
   - Rates API is fully implemented
   - Other APIs are scaffolded but incomplete
   - Bookings API missing price calculation logic

### Sample Questions to Ask

1. "What business entities did you find in the system?"
2. "Can you describe the relationship between Properties, Room Types, and Units?"
3. "Did you notice any issues with the data?"
4. "Which APIs are complete and which need work?"

---

## Part 2: Feature Implementation (60-75 minutes)

### Objective
Assess the candidate's ability to:
- Implement complex business logic
- Handle edge cases and error scenarios
- Write clean, maintainable code
- Make reasonable technical decisions
- Work with an existing codebase

### Task 1: Implement Booking Price Calculation (45-50 minutes)

**Instructions for Candidate:**

> "The most critical missing feature is the booking price calculation. When a customer wants to book a unit, we need to calculate the total price based on the room type's rates.
>
> Your task is to implement the price calculation logic in the Bookings API. Specifically:
>
> 1. Implement `POST /api/bookings/calculate-price`
> 2. Implement the price calculation in `POST /api/bookings`
>
> **Requirements:**
> - Given a unit_id, start_date, and end_date, calculate the total booking price
> - Use the room type's applicable rates (rates are at the room type level, not unit level)
> - Handle different rate types (hourly, daily, monthly)
> - Handle missing rates gracefully with clear error messages
> - Consider bookings that might span multiple rate periods
> - Return a detailed price breakdown
>
> **Business Rules (from PRD):**
> - Rates are defined by date ranges (effective_date to end_date)
> - A booking should use the rate(s) that overlap with its date range
> - If no rate exists for the booking period, return an error
> - For simplicity, assume daily rate type and whole-day bookings
>
> Feel free to ask clarifying questions as you would in a real work scenario."

**What to Observe:**

**Excellent:**
- Asks clarifying questions about edge cases upfront
- Plans approach before coding (pseudocode or verbal explanation)
- Implements comprehensive error handling
- Handles the case of missing rates
- Considers rate date range overlaps
- Writes helper functions to keep code organized
- Tests implementation with various scenarios
- Handles the overlapping rates bug in test data

**Good:**
- Implements basic price calculation correctly
- Handles common error cases
- Code is readable and follows existing patterns
- Tests happy path scenarios

**Concerning:**
- Jumps straight to coding without understanding requirements
- Doesn't handle missing rates
- Hardcodes values instead of using database queries
- Doesn't test the implementation
- Gets stuck on edge cases and doesn't ask for help

**Evaluation Criteria:**

| Aspect | Points | What to Look For |
|--------|--------|------------------|
| **Correctness** | 35% | Does the calculation work? Correct rate lookup? |
| **Error Handling** | 25% | Handles missing rates? Validates input? Clear error messages? |
| **Code Quality** | 20% | Readable? Well-structured? Follows patterns? |
| **Edge Cases** | 15% | Considers overlapping rates? Multiple rate periods? |
| **Testing** | 5% | Tests their implementation? |

### Task 2: Implement One CRUD API (15-20 minutes)

**Instructions for Candidate:**

> "Now let's fill in one of the scaffolded APIs. Please implement the CREATE endpoint for Properties:
>
> - `POST /api/properties`
>
> The scaffolded code has TODOs marking what needs to be done. Follow the pattern used in the Rates API."

**What to Observe:**

**Good:**
- Follows existing code patterns from rates.js
- Uses validation utilities correctly
- Generates proper IDs
- Returns appropriate status codes
- Implements in < 15 minutes

**Concerning:**
- Doesn't follow existing patterns
- Forgets validation
- Incorrect HTTP status codes
- Takes excessive time on simple CRUD

---

## Part 3: AI-Assisted Code Review (15-20 minutes)

### Objective
Assess the candidate's ability to:
- Use AI tools effectively for code analysis
- Interpret AI suggestions critically
- Prioritize issues
- Communicate technical problems clearly

### Instructions for Candidate

> "Now we want to see how you use AI tools in your development workflow. Please use any AI assistant (ChatGPT, Claude, Cursor, etc.) to:
>
> 1. Review the entire codebase for issues
> 2. Identify bugs, code smells, security vulnerabilities, and performance problems
> 3. Create a prioritized list of issues you found
> 4. For the top 3 issues, explain:
>    - What the problem is
>    - Why it's important
>    - How you would fix it
>
> You have 15 minutes. Focus on quality over quantity."

### Expected Findings

Candidates should identify some or all of these intentional issues:

**Bugs:**
1. **Missing Rate Overlap Detection** (rates.js:70, 105)
   - When creating/updating rates, no check for overlapping date ranges
   - Could lead to ambiguous pricing

2. **No Error Handling in Sync Endpoint** (rates.js:158)
   - File read could fail, no try-catch around file operations
   - Could crash the server

3. **Invalid Date Handling** (rates.js:51)
   - No validation that query param date is valid before using it
   - Could cause incorrect filtering or crashes

4. **Currency Validation Too Lenient** (validation.js:23)
   - Accepts any string for currency, should validate ISO codes
   - Could lead to data inconsistency

**Performance Issues:**
5. **Inefficient Query** (rates.js:16)
   - Loads all rates into memory even without filters
   - Should paginate or add limits

**Code Quality:**
6. **Placeholder Price Calculation** (bookings.js:136)
   - calculated_price is hardcoded to 0
   - Core feature not implemented (this is expected, but AI should flag it)

7. **Missing Referential Integrity Checks**
   - Scaffolded DELETE operations don't check for dependent records
   - Could lead to orphaned data

**Security:**
8. **No Input Sanitization**
   - User input not sanitized before database operations
   - Could be vulnerable to injection (though limited risk with JSON file DB)

9. **No Authentication/Authorization**
   - All endpoints are public
   - Production system would need auth

### What to Observe

**Excellent:**
- Uses AI effectively to quickly identify real issues
- Critically evaluates AI suggestions (doesn't blindly accept everything)
- Prioritizes issues by business impact
- Explains issues clearly with line numbers and context
- Proposes practical, specific fixes
- Identifies most of the intentional bugs

**Good:**
- Finds several real issues
- Reasonable prioritization
- Clear explanations
- Proposes fixes for top issues

**Concerning:**
- Gets distracted by style/formatting issues
- Can't explain why issues matter
- Blindly lists everything AI suggests without filtering
- Proposes overly complex solutions
- Misses obvious bugs

### Sample Follow-up Questions

1. "Which of these issues would you fix first if this were going to production next week?"
2. "How would you prevent the rate overlap issue?"
3. "Are any of the AI's suggestions incorrect or misguided? Why?"
4. "What testing would you add to catch these issues?"

---

## Scoring Rubric

### Part 1: Setup & Exploration (15 points)
- Setup completion (5 pts)
- Data issue identification (5 pts)
- System understanding (5 pts)

### Part 2: Implementation (60 points)

**Price Calculation (40 pts):**
- Correctness: 14 pts
- Error handling: 10 pts
- Code quality: 8 pts
- Edge cases: 6 pts
- Testing: 2 pts

**CRUD Implementation (20 pts):**
- Correctness: 10 pts
- Code quality: 7 pts
- Speed: 3 pts

### Part 3: AI-Assisted Review (25 points)
- Issue identification (10 pts)
- Prioritization (5 pts)
- Explanations (5 pts)
- Fix proposals (5 pts)

**Total: 100 points**

**Scoring:**
- 85-100: Strong hire
- 70-84: Hire
- 55-69: Borderline (additional assessment needed)
- Below 55: No hire

---

## Interview Tips

### For Interviewers

**Do:**
- Give hints if candidate is stuck for > 5 minutes
- Encourage questions and discussion
- Note problem-solving approach, not just final code
- Allow use of documentation/Google/AI
- Be flexible with time if candidate is making progress

**Don't:**
- Give away answers directly
- Interrupt while they're thinking/coding
- Be rigid about "perfect" solutions
- Penalize for syntax errors or typos
- Compare candidates' code styles

### Common Pitfalls to Watch For

1. **Analysis Paralysis**: Candidate overthinks before starting
   - *Intervention:* "Let's start with a simple version first"

2. **Scope Creep**: Candidate tries to fix everything
   - *Intervention:* "Let's focus on the core requirement first"

3. **Stuck on Environment**: Can't get setup working
   - *Intervention:* Help debug, don't waste time here

4. **No Testing**: Writes code but doesn't test it
   - *Intervention:* "How would you verify this works?"

---

## Candidate Handoff Document

### What to Send Before Interview

```
Subject: Technical Interview - SpaceRate Pro

Hi [Candidate Name],

Looking forward to our interview on [Date/Time]!

We'll be working with a rate management system called SpaceRate Pro.
Please clone this repository and have it ready: [REPO_URL]

You'll need:
- Node.js 18+ installed
- Your preferred code editor
- Access to an AI assistant (ChatGPT, Claude, etc.)

No need to study anything specific - we'll walk through everything together.

See you soon!
```

---

## Post-Interview Evaluation

### Questions for Interviewers to Answer

1. Did the candidate demonstrate understanding of the business domain?
2. How did they approach problem-solving? Methodical or trial-and-error?
3. Did they ask good clarifying questions?
4. How was their code quality? Would you want to maintain their code?
5. Did they test their work?
6. How did they handle getting stuck?
7. How did they use AI tools? Effectively or as a crutch?
8. Would you want them on your team?

### Red Flags

- Couldn't get the app running
- Didn't read the PRD
- Implemented wrong requirements
- No error handling whatsoever
- Couldn't explain their code
- Didn't test anything
- Defensive about suggestions
- Copy-pasted AI code without understanding

### Green Flags

- Asked about edge cases proactively
- Wrote clean, readable code
- Good variable/function names
- Explained their thought process
- Tested their implementation
- Identified bugs beyond the obvious
- Used AI as a tool, not a crutch
- Collaborative and communicative

---

**Good luck with the interviews!**
