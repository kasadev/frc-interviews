# Interview Follow-Up Questions Guide

This guide provides targeted follow-up questions for each phase of the interview to assess deeper understanding and reveal the candidate's thought process.

---

## Part 1: Setup & Exploration

### Domain Understanding Questions

**After candidate reads PRD:**

**Q1: "What's the difference between a Unit and a Room Type?"**
- **Great answer:** "Room Types are categories (like 'Executive Office'), and Units are specific instances (like 'Office 101'). We price at the Room Type level, so all units of the same type share the same rates."
- **Acceptable:** "Units are individual spaces, room types are the categories."
- **Red flag:** Confuses the two or doesn't understand the hierarchy.

---

**Q2: "Why do we have date ranges for rates instead of just a single price?"**
- **Great answer:** "Dynamic pricing. Demand changes over time - you might charge more in peak season or for last-minute bookings. Date ranges let you schedule price changes in advance."
- **Acceptable:** "Prices change over time."
- **Red flag:** "Not sure" or thinks it's unnecessarily complex.

---

**Q3: "What's the business impact of having missing rates for a room type?"**
- **Great answer:** "Customers can't book during that period, so it's lost revenue. Also creates operational confusion - staff might quote prices manually, leading to inconsistency. It's a data quality issue that should be flagged."
- **Acceptable:** "You can't book during those periods."
- **Red flag:** Doesn't see it as a problem or suggests allowing bookings without rates.

---

### Data Exploration Questions

**After candidate explores the data:**

**Q4: "Did you find any data quality issues?"**
- **Expected findings:**
  - Executive Office: Q2 rate gap
  - Meeting Room Large: No rates at all
  - Collaboration Space: H2 rate gap
  - Private Office: Overlapping rates
- **Great:** Finds all 4 issues and explains impact
- **Acceptable:** Finds 2-3 issues
- **Red flag:** Finds 0-1 or doesn't look at the data

---

**Q5: "What would you do about the overlapping rates in Private Office?"**
- **Great answer:** "This is ambiguous - which rate applies from June 15-30? I'd:
  1. Add validation to prevent overlaps when creating rates
  2. Clean up the existing data by adjusting date ranges
  3. If overlaps are intentional, add a priority field"
- **Acceptable:** "That's a bug, we should fix the data."
- **Red flag:** Doesn't see it as a problem or suggests picking one randomly.

---

**Q6: "How would you find which room types are missing rates?"**
- **Great answer:** "Query all room types, then for each one, query rates and check for date range coverage. Look for gaps or missing entries. Could write a data quality check script."
- **Acceptable:** "Look at the rates and see which room types are missing."
- **Red flag:** Manual inspection only, no systematic approach.

---

## Part 2: Implementation

### Price Calculation - Before Coding

**Q7: "Walk me through your approach for calculating booking prices."**
- **Great answer:** Outlines clear steps:
  1. Validate inputs
  2. Find unit → get room type
  3. Query rates for that room type
  4. Filter by date range overlap
  5. Calculate day-by-day with applicable rate
  6. Handle missing rates gracefully
- **Acceptable:** General idea of looking up rates and multiplying by days
- **Red flag:** Jumps straight to coding without a plan

---

**Q8: "What edge cases should we handle?"**
- **Great answer:** Lists several:
  - No rates available for date range
  - Booking spans multiple rate periods
  - Invalid dates (start after end, past dates)
  - Non-existent unit/room type
  - Overlapping rates
- **Acceptable:** Mentions 2-3 edge cases
- **Red flag:** "Just the happy path for now"

---

**Q9: "How would you handle a booking that spans Q1 and Q2, where Q2 rates are missing?"**
- **Great answer:** "I'd detect the gap and return a clear error message indicating which dates lack coverage. Can't create a booking without complete rate information - that's a data integrity issue."
- **Acceptable:** "Return an error."
- **Red flag:** "Calculate with available rates and use $0 for missing days" or "Just use the Q1 rate for all days."

---

### Price Calculation - During Coding

**Q10: "Why did you choose a day-by-day calculation approach?"**
- **Great answer:** "It handles rate transitions cleanly. If a booking spans multiple rate periods, I need to apply each rate to the appropriate days. Day-by-day iteration makes this straightforward and easy to test."
- **Acceptable:** "It's simple to implement."
- **Red flag:** Can't explain their approach or says "I copied it from somewhere."

---

**Q11: "What happens if someone books for one hour, not a full day?"**
- **Great answer:** "With the current implementation, I'm using daily rates and assuming full-day bookings. For hourly bookings, I'd need to:
  1. Check for hourly rate type
  2. Calculate hours instead of days
  3. Handle partial days
  This is a good feature to add but adds complexity."
- **Acceptable:** "I'm only handling daily bookings for now."
- **Red flag:** Doesn't recognize the limitation.

---

**Q12: "Should you calculate price on the client side or server side?"**
- **Great answer:** "Server side. Rates are sensitive business logic that shouldn't be exposed to clients. Also ensures consistency - all price calculations use the same logic. Client might show an estimate, but server is source of truth."
- **Acceptable:** "Server side for security."
- **Red flag:** "Client side is fine."

---

### Code Quality Questions

**Q13: "I notice you duplicated the price calculation logic in two endpoints. What would you do about this?"**
- **Great answer:** "Extract it into a shared utility function, maybe `utils/priceCalculator.js` with a function like `calculateBookingPrice(unit_id, start_date, end_date)`. Then both endpoints call it. Reduces duplication and makes testing easier."
- **Acceptable:** "Create a shared function."
- **Red flag:** "That's fine, duplication isn't a big deal."

---

**Q14: "How would you test this price calculation logic?"**
- **Great answer:**
  - "Unit tests for the calculation function with various scenarios:
    - Single rate period
    - Multiple rate periods
    - Missing rates
    - Edge dates
  - Integration tests for the API endpoints
  - Test with the known data issues (Q2 gap)"
- **Acceptable:** "Write tests for different date ranges."
- **Red flag:** "Test it manually with curl."

---

### CRUD Implementation Questions

**Q15: "What validation should we do when creating a property?"**
- **Great answer:** References validation.js and lists:
  - Required fields (name, address, timezone)
  - Valid timezone (from tz database)
  - Unique name (optional but good practice)
  - Valid status enum
- **Acceptable:** "Check required fields."
- **Red flag:** "Just insert it."

---

**Q16: "What should happen if someone tries to delete a property that has room types?"**
- **Great answer:** "Should fail with a clear error message about referential integrity. Can't delete a property if it has dependent data. Options:
  1. Block deletion (recommended)
  2. Cascade delete (risky - would delete room types, units, bookings)
  3. Soft delete (mark inactive but preserve data)"
- **Acceptable:** "Should return an error."
- **Red flag:** "Just delete it."

---

## Part 3: AI-Assisted Code Review

### Critical Thinking Questions

**Q17: "The AI suggested adding authentication. Do you agree?"**
- **Great answer:** "Yes for production, but this is a local development interview project. Auth isn't the focus here. I'd prioritize it lower than fixing the rate overlap bug and error handling issues."
- **Acceptable:** "Yes, we should add auth."
- **Red flag:** Blindly agrees with everything AI says or dismisses it entirely.

---

**Q18: "How do you decide which issues to fix first?"**
- **Great answer:** "Prioritize by:
  1. **Business impact** - Does it lose revenue or create bad customer experience?
  2. **Severity** - Can it crash the system or corrupt data?
  3. **Frequency** - How often will users hit this?
  4. **Effort** - Quick wins vs major refactors
  Critical bugs (overlap validation, sync error handling) before nice-to-haves (pagination)."
- **Acceptable:** "Fix bugs first, then optimizations."
- **Red flag:** No clear prioritization or wants to fix everything at once.

---

**Q19: "The AI flagged the inefficient query that loads all rates. Is this a real problem?"**
- **Great answer:** "Depends on scale. With 12 rates, not a problem. With 100,000 rates, it's a major issue - slow queries, high memory usage. For this interview project, I'd document it but not fix it immediately. In production with growth projections, I'd add pagination."
- **Acceptable:** "It could be a problem with lots of data."
- **Red flag:** "It's definitely a problem" (without considering scale) or "It's fine" (without caveats).

---

**Q20: "How would you fix the rate overlap validation issue?"**
- **Great answer:** Provides specific code:
  ```javascript
  // Query existing rates for same room type and rate type
  // Check for date range overlaps using interval intersection
  // Return validation error if overlap found
  ```
  Explains the algorithm clearly.
- **Acceptable:** Describes the approach at high level.
- **Red flag:** Vague or suggests storing all rates in a different structure.

---

### Probing Deeper

**Q21: "What security issues did you find?"**
- **Expected findings:**
  - No authentication/authorization
  - No input sanitization (though limited risk with JSON file DB)
  - No rate limiting
  - No HTTPS enforcement
  - Sensitive data (rates) exposed without access control
- **Great:** Identifies 3+ issues and explains impact
- **Acceptable:** Identifies 1-2 issues
- **Red flag:** "Looks secure to me"

---

**Q22: "The file-based database could have race conditions. Explain."**
- **Great answer:** "Two concurrent requests could read→modify→write the same file, and one update would overwrite the other. Need file locking or atomic operations. This is why real apps use databases with transaction support. Document that this is dev-only."
- **Acceptable:** "Concurrent writes could cause issues."
- **Red flag:** Doesn't understand the problem.

---

## Part 4: Test Review (Bonus)

**Q23: "Are there any tests that don't align with the PRD?"**
- **Expected findings:** (See SAMPLE_INTERVIEW.md for full list)
  - Test expects invalid currency to be accepted
  - Test expects overlapping rates to be allowed
  - Test expects invalid dates to be ignored
  - Test uses wrong rate type logic
  - Test expects bookings without rates to succeed
- **Great:** Finds 4-5 buggy tests, explains why they're wrong
- **Acceptable:** Finds 2-3 buggy tests
- **Red flag:** "Tests look good to me"

---

**Q24: "What test coverage is missing?"**
- **Great answer:**
  - Multi-rate period price calculations
  - Monthly rate type handling
  - Double-booking prevention
  - Currency consistency between rate and booking
  - Concurrent booking scenarios
  - Error message clarity
- **Acceptable:** Mentions 2-3 missing areas
- **Red flag:** "Coverage looks complete"

---

**Q25: "Should we fix the buggy tests or the code?"**
- **Great answer:** "The tests are buggy - they don't match the PRD. Fix the tests to reflect correct requirements. Then if the code fails the tests, fix the code. The PRD is the source of truth."
- **Acceptable:** "Fix the tests."
- **Red flag:** "Fix the code to pass the tests."

---

## Behavioral Follow-Ups

### Communication & Collaboration

**Q26: "How would you handle discovering these data quality issues (missing rates) in production?"**
- **Great answer:**
  - Immediately notify the team/stakeholders
  - Assess business impact (how many customers affected?)
  - Create data quality check script to find all gaps
  - Work with business team to fill missing rates
  - Implement validation to prevent future issues
  - Consider backward-compatible fixes for existing bookings
- **Acceptable:** "Report it and fix the data."
- **Red flag:** "Just add some dummy rates."

---

**Q27: "You mentioned several refactoring opportunities. How do you decide when to refactor vs keep moving?"**
- **Great answer:** "Balance short-term velocity with long-term maintainability. Refactor when:
  - Code will be modified frequently (price calculation)
  - Duplication makes bugs likely
  - Technical debt is slowing the team down
  Don't refactor:
  - Code that works and rarely changes
  - When shipping fast is critical
  - Before understanding requirements fully
  Document technical debt for later."
- **Acceptable:** "Refactor when there's time."
- **Red flag:** "Always refactor immediately" or "Never refactor."

---

**Q28: "If you were joining this team tomorrow, what would you want to know about this codebase?"**
- **Great answer:**
  - Why file-based DB? (dev convenience? migration plan?)
  - What's the external rate sync cadence?
  - Are there known customers hitting the rate gaps?
  - What's the deployment process?
  - Are there monitoring/alerting for data quality?
  - What's the roadmap for the next quarter?
- **Acceptable:** Asks about deployment and monitoring
- **Red flag:** No questions or only asks about their own tasks

---

## Question Selection Strategy

### For Each Candidate, Choose Questions That:

1. **Assess Core Skills** (Must ask)
   - Q4: Data quality issues (observation)
   - Q7: Approach explanation (problem-solving)
   - Q10: Code explanation (understanding)
   - Q18: Prioritization (judgment)

2. **Probe Deeper When** (Situational)
   - Candidate seems stuck → Q3, Q8 (guiding questions)
   - Candidate rushes → Q11, Q14 (edge case questions)
   - Candidate is doing well → Q22, Q27 (advanced questions)

3. **Evaluate Fit** (Optional but valuable)
   - Q26, Q28 (behavioral/team fit)

### Time Management

- **Part 1:** 2-3 questions (5 min)
- **Part 2:** 4-6 questions (15 min)
- **Part 3:** 3-4 questions (10 min)
- **Part 4:** 2-3 questions if time permits

### Red Flags to Watch For

- Candidate argues defensively instead of discussing trade-offs
- Can't explain their own code
- Dismisses edge cases as "unlikely"
- Doesn't reference PRD when making decisions
- Suggests hacky solutions without acknowledging technical debt
- Blindly trusts AI without critical evaluation
- Doesn't ask clarifying questions

### Green Flags to Note

- Asks "why" questions about business requirements
- Identifies trade-offs unprompted
- References PRD proactively
- Thinks about production implications
- Admits uncertainty and asks for guidance
- Explains thought process clearly
- Tests their own work
- Learns quickly from feedback

---

## Post-Interview Calibration

After using these questions, evaluate:

1. **Did the questions reveal the candidate's depth?**
2. **Were any questions too easy/hard for this level?**
3. **Did the candidate ask good questions back?**
4. **How did they handle not knowing something?**

Adjust question difficulty for future candidates based on team feedback.
