# Interviewer Script & Presentation Guide

This script provides word-for-word guidance on how to introduce and facilitate each part of the interview. Use this to ensure consistent candidate experience.

---

## Pre-Interview Setup (10 minutes before)

### Checklist
- [ ] Repository link ready to share
- [ ] FOLLOW_UP_QUESTIONS.md open for reference
- [ ] EVALUATION_CHECKLIST.md ready for scoring
- [ ] Screen sharing setup tested
- [ ] Recording started (if applicable)

### What to Send Candidate (10 min before interview)

```
Subject: Interview Starting Soon - Setup Instructions

Hi [Candidate Name],

Our interview starts in 10 minutes. Please have this repository cloned and ready:

https://github.com/kasadev/frc-interviews

Quick setup:
1. git clone https://github.com/kasadev/frc-interviews.git
2. cd frc-interviews
3. npm install
4. npm start

You'll need Node.js 18+ installed.

See you soon!
```

---

## Interview Opening (5 minutes)

### Introduction Script

**YOU SAY:**

> "Hi [Candidate Name], thanks for joining today! I'm [Your Name], [Your Role] on the [Team Name] team.
>
> Today we're going to work together on a coding exercise - it's designed to simulate the kind of work you'd do on our team. This is a collaborative session, not a test, so feel free to ask questions as you would with a teammate.
>
> Here's how we'll structure the next 2 hours:
>
> **Part 1 (15-20 min):** You'll set up the project, read through the requirements, and explore the codebase.
>
> **Part 2 (60-75 min):** You'll implement some features - specifically booking price calculation logic. This is the core of the exercise.
>
> **Part 3 (15-20 min):** You'll use AI tools to review the codebase for bugs and issues.
>
> The exercise is intentionally challenging - we don't expect you to complete everything perfectly. We're more interested in your problem-solving approach, how you handle edge cases, and how you communicate your thinking.
>
> Sound good? Any questions before we start?"

**WAIT FOR RESPONSE**

---

**YOU SAY:**

> "Great! Let me share some context about the domain:
>
> We're working with **SpaceRate Pro**, a rate management system for a short-term rental hospitality company - think vacation rentals, apartments, that kind of thing.
>
> The system manages:
> - **Properties** - buildings or locations
> - **Room Types** - categories like '1-Bedroom', '2-Bedroom', 'Studio'
> - **Units** - individual rentable apartments or homes
> - **Rates** - pricing that changes based on date ranges
>
> The key thing to understand: **We price at the Room Type level**, not the individual unit level. So all 1-Bedroom apartments in a property share the same rate schedule.
>
> Make sense so far?"

**WAIT FOR CONFIRMATION**

---

**YOU SAY:**

> "Perfect. Have you cloned the repository and got the server running?"

**IF NO:**

> "No problem, let's get that set up. The instructions are in the README. I'll give you 5 minutes to get it running. Let me know if you hit any issues."

**IF YES:**

> "Excellent! Let's move to Part 1."

---

## Part 1: Setup & Exploration (15-20 minutes)

### Introduction Script

**YOU SAY:**

> "Okay, Part 1 is exploration. I'd like you to:
>
> 1. **Read the PRD.md file** - this has the product requirements and business rules
> 2. **Explore the codebase** - understand the structure
> 3. **Test the API endpoints** - make sure you can hit them with curl or Postman
> 4. **Look at the seed data** - check what's in the system
>
> Specifically, I want you to look for **data quality issues** - are there any problems with the rates or room types that could cause issues for customers?
>
> Think of this as your first day on the team, and you're getting familiar with the codebase.
>
> You have about 15 minutes. Think out loud as you explore - I want to understand your thought process. Ready?"

### What to Observe

**Silently note:**
- [ ] Do they read README/PRD before randomly clicking?
- [ ] Do they test the endpoints systematically?
- [ ] Do they explore the data files?
- [ ] Do they think out loud?

### When They're Reading the PRD (3-5 min)

**Stay quiet.** Let them read.

After they finish reading, ask:

**YOU SAY:**

> "What's your understanding of the entity hierarchy? How do Properties, Room Types, Units, and Rates relate to each other?"

**Listen for correct understanding:**
- Properties → Room Types → Units
- Rates belong to Room Types
- Units inherit pricing from their Room Type

**If they struggle, guide them:**

> "Think about it like a tree structure. What's at the top level?"

---

### When They're Exploring Data (5-10 min)

Let them explore. **DO NOT interrupt** unless they're stuck.

After 10 minutes, if they haven't mentioned data issues, prompt them:

**YOU SAY:**

> "Did you notice anything unusual about the rates data? Any gaps or inconsistencies?"

**They should find:**
1. Executive Office: Missing Q2 rates
2. Meeting Room Large: No rates at all
3. Collaboration Space: Missing H2 rates
4. Private Office: Overlapping rates

**If they find 3-4 issues:**

> "Great catch! What would be the business impact of these issues?"

**If they find 0-2 issues:**

> "Take another look at the rates for Executive Office - what do you notice about the date ranges?"

---

### Transition to Part 2

**YOU SAY:**

> "Excellent exploration. You found [X issues]. These data quality problems are intentional - they're part of what makes this exercise realistic.
>
> Now let's move to the implementation phase, where you'll build on top of this system."

---

## Part 2: Implementation (60-75 minutes)

### Task 1: Price Calculation (45-50 min)

**YOU SAY:**

> "The most critical missing feature is **booking price calculation**. When a customer wants to book a unit, we need to calculate the total price based on the room type's rates.
>
> Open the file `src/routes/bookings.js` and look at the endpoint `POST /api/bookings/calculate-price`.
>
> You'll see it's marked as 'NOT IMPLEMENTED'. Your task is to implement this endpoint.
>
> Here's what it should do:
>
> **Input:**
> - unit_id (which unit to book)
> - start_date (booking start)
> - end_date (booking end)
>
> **Output:**
> - Calculated total price
> - Price breakdown by rate period
> - Currency
>
> **Business Rules:**
> - Find the unit's room type
> - Find applicable rates for that room type
> - Calculate price day-by-day using the applicable rate
> - If rates are missing for any date in the range, return an error
>
> For simplicity, **assume daily rates and full-day bookings**. Don't worry about hourly rates for now.
>
> **Important:** Handle the data quality issues we found. Missing rates should return clear error messages.
>
> Any questions before you start?"

---

### During Implementation

**Let them work.** Your job is to observe, not to direct.

**DO:**
- ✅ Let them struggle for a bit (up to 5 min) before helping
- ✅ Answer clarifying questions about requirements
- ✅ Encourage them to test their code
- ✅ Ask about their approach if they're silent for too long

**DON'T:**
- ❌ Give them the algorithm
- ❌ Point out bugs immediately
- ❌ Compare them to other candidates
- ❌ Interrupt while they're clearly making progress

---

### Good Checkpoints (Ask these if they don't explain unprompted)

**After 10 minutes:**

> "Walk me through your approach. What's your plan?"

**After 25 minutes:**

> "How are you handling the case where rates don't exist for the booking period?"

**After 35 minutes:**

> "Have you tested your implementation? Let's try a few scenarios."

**Suggested Test Scenarios:**

```bash
# Test 1: Simple booking in Q1 (should work)
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"unit_id":"unit_dt_exec_001","start_date":"2025-02-01","end_date":"2025-02-11"}'

# Expected: $1,500 (10 days × $150)

# Test 2: Booking with missing rates (should error)
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"unit_id":"unit_dt_exec_001","start_date":"2025-04-01","end_date":"2025-04-10"}'

# Expected: Error "No rates available"

# Test 3: Room type with no rates (should error)
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{"unit_id":"unit_dt_meet_001","start_date":"2025-02-01","end_date":"2025-02-10"}'

# Expected: Error "No rates available"
```

---

### If They Get Stuck (5+ minutes no progress)

**Option 1: Ask guiding questions**

> "What's blocking you right now?"
>
> "What data do you need to calculate the price?"
>
> "How would you find the applicable rate for a given date?"

**Option 2: Give a hint**

> "Think about it as iterating day-by-day through the booking period. For each day, find the rate that covers that date."

**Option 3: If really stuck (last resort)**

> "Let me give you a hint: You need to:
> 1. Get the unit's room type
> 2. Query rates for that room type
> 3. For each day in the booking, find which rate applies
> 4. Sum up the daily charges
>
> Does that help?"

---

### Transition to Booking Creation

**After calculate-price is working:**

**YOU SAY:**

> "Nice work! The calculation logic looks good. Now let's integrate it into the booking creation endpoint.
>
> In the same file, find `POST /api/bookings`. You'll see it has a placeholder where `calculated_price` is set to 0.
>
> Can you integrate your price calculation logic so that when we create a booking, it automatically calculates and stores the correct price?
>
> You have about 10 minutes for this."

**This is a pattern-following exercise.** They should reuse their calculation logic.

---

### Task 2: CRUD Implementation (10-15 min)

**YOU SAY:**

> "Great! One more quick task. We have several scaffolded API endpoints that are returning 501 'Not Implemented'.
>
> Let's fill in one of them. Open `src/routes/properties.js` and implement the `POST /api/properties` endpoint.
>
> Use the `rates.js` file as a reference for the pattern. This should be straightforward - just validate the input, generate an ID, and insert into the database.
>
> You have about 10 minutes."

**This tests:**
- Can they follow existing patterns?
- How quickly can they implement simple CRUD?

---

## Part 3: AI-Assisted Code Review (15-20 minutes)

### Introduction Script

**YOU SAY:**

> "Excellent work on the implementation! Now for the final part, we want to see how you use AI tools in your workflow.
>
> We know there are bugs and issues in this codebase - some intentional, some we might have missed. Your task is to use an AI assistant like ChatGPT, Claude, GitHub Copilot, or whatever you prefer to **review the codebase for issues**.
>
> Specifically, look for:
> - Logic bugs
> - Security vulnerabilities
> - Performance problems
> - Missing error handling
> - Code quality issues
>
> You have 15 minutes. At the end, I want you to:
> 1. Present a **prioritized list** of the issues you found
> 2. For the **top 3 issues**, explain:
>    - What the problem is
>    - Why it's important
>    - How you would fix it
>
> Focus on quality over quantity - I'd rather see 3 well-explained critical issues than 20 trivial style complaints.
>
> Ready?"

---

### During AI Review

**Let them work independently.** This is about their process.

**Observe:**
- [ ] Which AI tool do they choose?
- [ ] How do they prompt the AI?
- [ ] Do they critically evaluate AI suggestions or accept blindly?
- [ ] Do they organize findings well?

---

### After 15 Minutes

**YOU SAY:**

> "Okay, time's up! Walk me through what you found. Start with your top priority issue."

**For each issue they present, ask:**

> "Why did you prioritize this one?"
>
> "How would you fix it?"
>
> "Did the AI suggest this, or did you identify it yourself?"

**Good follow-up questions:**

> "The AI probably suggested adding authentication. Do you agree that's a priority for this project?"
>
> "Did you find any suggestions from the AI that you disagreed with?"

---

## Bonus: Test Review (10 minutes if time permits)

**YOU SAY:**

> "One last thing if we have time: We have some tests in the `/tests` folder. Can you quickly review them and tell me if you notice any issues?
>
> Specifically, do any of the test expectations conflict with the PRD requirements?"

**They should find:**
- Tests that expect invalid data to be accepted
- Tests that expect wrong behavior (e.g., overlapping rates allowed)
- Tests with wrong business logic

---

## Closing (5 minutes)

### Wrap-Up Script

**YOU SAY:**

> "That's it for the coding portion! You did [great/well/a solid job].
>
> Before we wrap up, I want to give you a chance to ask questions. What would you like to know about:
> - The team?
> - The role?
> - Our tech stack?
> - This codebase or the kinds of problems we work on?
>
> Ask me anything!"

---

### Final Questions for Candidate

**YOU ASK:**

> "Imagine you're joining the team tomorrow and taking ownership of this codebase. What would be your priorities in the first week?"

**Listen for:**
- Fix critical bugs (rate overlap, sync error handling)
- Add monitoring/observability
- Improve test coverage
- Document known issues
- Meet with stakeholders

---

> "If you had unlimited time, what would you refactor or improve in this system?"

**Listen for:**
- Extract price calculation to shared utility
- Replace file-based DB with real database
- Add authentication/authorization
- Implement proper logging
- Add data quality checks

---

> "Do you have any concerns or questions about this role or the team?"

---

### Thank You

**YOU SAY:**

> "Thanks so much for your time today, [Candidate Name]! We'll follow up with next steps within [timeframe].
>
> Do you have any final questions for me?"

**After the call ends, immediately fill out EVALUATION_CHECKLIST.md while it's fresh.**

---

## Common Scenarios & How to Handle

### Scenario 1: Candidate Finishes Early (90 minutes)

**Offer stretch goals:**

> "You're ahead of schedule! Want to tackle some stretch goals?
>
> - Implement UPDATE and DELETE for properties
> - Add rate overlap detection to prevent the bug we saw
> - Refactor price calculation into a shared utility
> - Write a data quality check script
>
> Pick whichever sounds interesting!"

---

### Scenario 2: Candidate is Stuck (30+ min no progress)

**Intervene gently:**

> "I notice you've been working on this for a while. Want to talk through where you're stuck?
>
> Let's break this down into smaller steps together..."

**Offer to pair program:**

> "How about we work on this together for a few minutes? You drive, I'll help you think through it."

---

### Scenario 3: Candidate Wants to Use Google/Stack Overflow

**Encourage it!**

> "Absolutely! Use whatever resources you'd normally use. This is meant to simulate real work."

---

### Scenario 4: Candidate Finds Bugs We Didn't Intend

**This is great!**

> "Nice catch! That's actually not one of our intentional bugs - you found a real issue. How would you fix it?"

---

### Scenario 5: Candidate Asks "How Would You Do This?"

**Redirect:**

> "I'm curious how you would approach it. What are you considering?"

**If they're really stuck:**

> "In our codebase, we tend to [general principle]. Does that help?"

---

## Red Flags to Watch For

### During Interview

🚩 **Doesn't read documentation** before asking questions
🚩 **Defensive** when you point out edge cases
🚩 **Doesn't test** their code at all
🚩 **Copies code** without understanding it
🚩 **Can't explain** their own implementation
🚩 **Dismisses edge cases** as "unlikely"
🚩 **Blames the tools** ("This would be easier in Python")
🚩 **Gives up** without asking for help

### After Interview

🚩 **Can't answer** "Why did you make that choice?"
🚩 **No questions** about the team or role
🚩 **Argues** instead of discusses trade-offs
🚩 **Blindly trusts** AI without critical thinking

---

## Green Flags to Note

### During Interview

✅ **Asks clarifying questions** about requirements
✅ **Thinks out loud** and explains their approach
✅ **Tests their code** proactively
✅ **Handles feedback** well
✅ **Identifies trade-offs** without prompting
✅ **Admits when stuck** and asks for help appropriately
✅ **References the PRD** when making decisions
✅ **Considers edge cases** upfront

### After Interview

✅ **Thoughtful questions** about team processes
✅ **Discusses trade-offs** openly
✅ **Shows curiosity** about the business domain
✅ **Reflects on what they'd do differently**
✅ **Critically evaluates** AI suggestions

---

## Post-Interview Immediately

**Fill out EVALUATION_CHECKLIST.md within 30 minutes while fresh.**

**Document:**
- Overall impression
- Specific examples (good and bad)
- How they compared to the sample interview
- Any standout moments
- Concerns or hesitations

**Discuss with other interviewers within 24 hours for calibration.**

---

## Tips for Success

### Before Interview
- Practice the script once
- Time yourself (should take ~10 min to cover all intro material)
- Have test curl commands ready to paste

### During Interview
- Take notes on EVALUATION_CHECKLIST.md as you go
- Watch body language / tone for frustration
- Be encouraging but not leading

### After Interview
- Complete rubric immediately
- Compare to SAMPLE_INTERVIEW.md example
- Discuss with hiring manager before deciding

---

**Remember:** You're evaluating both **technical skills** and **collaboration ability**. The best candidate might not finish everything, but they'll communicate well, ask good questions, and demonstrate strong problem-solving.

Good luck!
