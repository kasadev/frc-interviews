# Evaluation Rubric - StayRate Interview

**Philosophy:** This rubric is calibrated so that a **good candidate scores 80%** (70-84 points). Exceptional candidates will score 85-100. The interview is intentionally challenging - candidates should NOT complete everything perfectly.

---

## Scoring Overview

| Score Range | Rating | Decision | Expected Completion |
|-------------|---------|----------|---------------------|
| **90-100** | Exceptional | Strong Hire | 95%+ complete, handles all edge cases, exceptional code quality |
| **70-89** | Good | Hire | 80-90% complete, solid implementation, good problem-solving |
| **55-69** | Borderline | Additional Review | 60-75% complete, implementation works but rough edges |
| **40-54** | Below Bar | No Hire | 40-60% complete, significant gaps in implementation |
| **0-39** | Not Ready | No Hire | <40% complete, fundamental skill gaps |

**Target:** Most good senior engineers should score 75-82 points.

---

## Part 1: Setup & Code Exploration (20 points)

### 1.1 Environment Setup (5 points)

| Score | Criteria |
|-------|----------|
| **5** | Completes setup in < 5 min, reads README first, verifies server is running |
| **4** | Completes setup in 5-10 min, minor issues resolved independently |
| **3** | Completes setup in 10-15 min, needs some guidance |
| **2** | Struggles with setup, requires significant help |
| **1** | Cannot complete setup without detailed walkthrough |
| **0** | Fails to get server running |

**Expected for Good Candidate:** 4-5 points

---

### 1.2 PRD Comprehension (5 points)

| Score | Criteria |
|-------|----------|
| **5** | Clearly explains entity hierarchy, pricing model, and business rules. Asks insightful clarifying questions. |
| **4** | Understands the domain, explains key concepts correctly |
| **3** | Basic understanding, needs prompting for details |
| **2** | Superficial understanding, misses key concepts |
| **1** | Struggles to explain the system after reading PRD |
| **0** | Doesn't read PRD or shows no comprehension |

**Expected for Good Candidate:** 4-5 points

---

### 1.3 Data Quality Analysis (10 points)

Candidate should identify issues by exploring the data:

| Issue | Points | How to Find |
|-------|--------|-------------|
| **Executive Office Q2 gap** | 2.5 | Check rates for rt_exec_office_dt, notice April-June missing |
| **Meeting Room no rates** | 2.5 | Check rates for rt_meeting_large_dt, find zero results |
| **Collaboration Space H2 gap** | 2.5 | Check rates for rt_collab_space_tc, notice July-Dec missing |
| **Private Office overlaps** | 2.5 | Check rates for rt_private_office_tc, notice June 15-30 overlap |

**Scoring:**
- **10 points:** Finds all 4 issues + explains business impact
- **8 points:** Finds 3-4 issues
- **6 points:** Finds 2 issues
- **4 points:** Finds 1 issue
- **0-2 points:** Finds 0 issues or doesn't explore data

**Expected for Good Candidate:** 7-10 points

---

## Part 2: Implementation (60 points)

This is the core assessment. Even good candidates may not complete everything perfectly.

### 2.1 Booking Price Calculation - /calculate-price Endpoint (35 points)

#### Core Functionality (20 points)

| Score | Criteria |
|-------|----------|
| **18-20** | **Exceptional:** Correct algorithm, handles all edge cases, clean code, comprehensive error handling, provides price breakdown |
| **15-17** | **Good:** Correct algorithm, handles most edge cases, good error handling, works for test scenarios |
| **12-14** | **Acceptable:** Basic algorithm works, handles some edge cases, partial error handling |
| **8-11** | **Needs Work:** Algorithm has flaws, limited error handling, works for happy path only |
| **0-7** | **Insufficient:** Algorithm incorrect, doesn't work for basic scenarios |

**Test Scenarios to Evaluate Against:**
```javascript
// Scenario 1: Simple booking within one rate period
unit_dt_exec_001, 2025-02-01 to 2025-02-11
Expected: 10 days × $150 = $1,500 ✓

// Scenario 2: Booking with missing rates
unit_dt_exec_001, 2025-04-01 to 2025-04-10
Expected: Error "No rates available" ✓

// Scenario 3: Booking spanning multiple rate periods
unit_dt_exec_001, 2025-03-25 to 2025-07-05
Expected: Error "Rate gap" (Q2 has no rates) ✓

// Scenario 4: Room type with no rates
unit_dt_meet_001, 2025-02-01 to 2025-02-10
Expected: Error "No rates available" ✓
```

**Expected for Good Candidate:** 15-17 points

---

#### Error Handling & Edge Cases (10 points)

| Category | Points | Criteria |
|----------|--------|----------|
| **Input Validation** | 3 | Validates unit_id, start_date, end_date presence and format |
| **Missing Rate Handling** | 3 | Clear error when rates don't exist for date range |
| **Invalid Date Handling** | 2 | Validates dates are valid and start < end |
| **Non-existent Unit** | 2 | Returns 404 with clear message |

**Deductions:**
- Missing any validation: -2 points per category
- Poor error messages (no details): -1 point per category

**Expected for Good Candidate:** 7-10 points

---

#### Code Quality (5 points)

| Score | Criteria |
|-------|----------|
| **5** | Clean, readable code. Good variable names. Logical structure. Comments for complex logic. |
| **4** | Readable code, mostly well-organized, minor style issues |
| **3** | Code works but hard to follow, inconsistent style |
| **2** | Messy code, poor structure, hard to maintain |
| **1** | Very poor code quality, difficult to understand |

**Expected for Good Candidate:** 4-5 points

---

### 2.2 Booking Creation - POST /bookings (15 points)

#### Implementation (10 points)

| Score | Criteria |
|-------|----------|
| **9-10** | Integrates price calculation, checks unit availability, handles errors, creates booking correctly |
| **7-8** | Price calculation integrated, basic validation, mostly working |
| **5-6** | Partial implementation, price calculation attempted but incomplete |
| **3-4** | Basic structure only, price calculation not working |
| **0-2** | Minimal or no implementation |

**Expected for Good Candidate:** 7-9 points

---

#### Validation & Error Handling (5 points)

- Unit exists check (1 point)
- Unit availability check (2 points)
- Rate availability check (1 point)
- Clear error messages (1 point)

**Expected for Good Candidate:** 3-5 points

---

### 2.3 CRUD Implementation - Properties POST (10 points)

This is a "pattern-following" exercise to see if candidate can quickly implement a simple endpoint.

| Score | Criteria |
|-------|----------|
| **9-10** | Complete, correct implementation in < 15 min. Follows existing patterns. Validates input. Tests it. |
| **7-8** | Working implementation, minor issues, completed in reasonable time |
| **5-6** | Partial implementation or takes excessive time (>25 min) |
| **3-4** | Incomplete or non-functional |
| **0-2** | Not attempted or completely wrong |

**Expected for Good Candidate:** 7-9 points

---

## Part 3: AI-Assisted Code Review (20 points)

This tests the candidate's ability to use AI tools effectively and think critically.

### 3.1 Issue Identification (10 points)

Candidate should find the intentional bugs using AI:

| Category | Points | Issues to Find |
|----------|--------|----------------|
| **Critical Issues** | 6 | • Missing rate overlap validation<br>• No error handling in sync endpoint<br>• Invalid date not validated |
| **High Priority** | 3 | • Currency validation too lenient<br>• Inefficient query (loads all rates) |
| **Code Quality** | 1 | • Code duplication in bookings<br>• Missing referential integrity checks |

**Scoring:**
- **10:** Finds all or most issues across all categories
- **8:** Finds all critical issues + some high priority
- **6:** Finds 2-3 critical issues
- **4:** Finds 1-2 issues total
- **0-2:** Finds 0-1 issues or lists trivial style issues only

**Expected for Good Candidate:** 7-9 points

---

### 3.2 Prioritization & Recommendations (5 points)

| Score | Criteria |
|-------|----------|
| **5** | Excellent prioritization by business impact. Proposes specific, actionable fixes with code examples. |
| **4** | Good prioritization. Clear fix proposals. |
| **3** | Basic prioritization (critical vs non-critical). Generic fix suggestions. |
| **2** | Poor prioritization. Vague fix suggestions. |
| **0-1** | No prioritization. No actionable recommendations. |

**Expected for Good Candidate:** 3-5 points

---

### 3.3 Critical Evaluation of AI Suggestions (5 points)

Tests if candidate blindly trusts AI or thinks critically.

| Score | Criteria |
|-------|----------|
| **5** | Evaluates AI suggestions critically. Identifies false positives (e.g., auth for dev project). Considers context. |
| **4** | Mostly critical evaluation. Catches some false positives. |
| **3** | Accepts most AI suggestions but questions a few. |
| **2** | Blindly accepts most AI suggestions without evaluation. |
| **0-1** | No critical thinking. Accepts everything AI says. |

**Expected for Good Candidate:** 3-4 points

---

## Bonus: Test Review (Up to +10 points)

Optional section if time permits. Does not count against candidate if skipped.

### Buggy Test Identification (5 points)

| Bugs Found | Points |
|------------|--------|
| 5+ buggy tests | 5 |
| 3-4 buggy tests | 4 |
| 2 buggy tests | 3 |
| 1 buggy test | 2 |
| 0 buggy tests | 0 |

**Buggy Tests:**
1. Accepts invalid currency (rates.test.js:47)
2. Allows overlapping rates (rates.test.js:77)
3. Ignores invalid date format (rates.test.js:117)
4. Uses wrong rate type logic (bookings.test.js:38)
5. Accepts missing rates with $0 price (bookings.test.js:69)
6. Expects zero price for non-existent unit (bookings.test.js:94)
7. Keeps original price when dates change (bookings.test.js:144)
8. Expects hard delete instead of soft delete (bookings.test.js:169)

---

### Missing Coverage Identification (3 points)

- Identifies 3+ missing test scenarios: 3 points
- Identifies 2 missing scenarios: 2 points
- Identifies 1 missing scenario: 1 point

**Missing Coverage:**
- Multi-rate period calculations
- Monthly rate type handling
- Double-booking prevention
- Currency consistency
- Unit status updates

---

### Test vs PRD Alignment (2 points)

- **2 points:** Explains why tests are wrong with PRD references
- **1 point:** Identifies tests are wrong but weak explanation
- **0 points:** Doesn't recognize PRD misalignment

---

## Scoring Examples

### Example 1: Strong Hire (91 points)

**Part 1:** 18/20
- Setup: 5/5
- PRD: 5/5
- Data issues: 8/10 (missed 1 issue)

**Part 2:** 50/60
- Price calculation: 32/35 (minor edge case handling gap)
- Booking creation: 12/15 (good but not perfect)
- CRUD: 8/10 (completed quickly, minor issue)

**Part 3:** 18/20
- Issue identification: 9/10
- Prioritization: 5/5
- Critical thinking: 4/5

**Bonus:** +5
- Found 4 buggy tests, identified missing coverage

**Total: 91/100 - Strong Hire**

---

### Example 2: Hire (78 points)

**Part 1:** 16/20
- Setup: 4/5 (took 8 minutes)
- PRD: 5/5
- Data issues: 7/10 (found 3 issues)

**Part 2:** 45/60
- Price calculation: 30/35 (good algorithm, some edge cases missed)
- Booking creation: 10/15 (working but incomplete error handling)
- CRUD: 7/10 (took 20 min but correct)

**Part 3:** 14/20
- Issue identification: 7/10 (found main bugs)
- Prioritization: 4/5
- Critical thinking: 3/5

**Bonus:** +3
- Found 2 buggy tests

**Total: 78/100 - Hire**

---

### Example 3: Borderline (65 points)

**Part 1:** 13/20
- Setup: 3/5 (took 12 min, needed help)
- PRD: 4/5
- Data issues: 6/10 (found 2 issues)

**Part 2:** 38/60
- Price calculation: 24/35 (algorithm works for happy path, weak error handling)
- Booking creation: 8/15 (partial integration, price calc has issues)
- CRUD: 6/10 (functional but took 30 min)

**Part 3:** 11/20
- Issue identification: 6/10 (found 2 critical bugs)
- Prioritization: 3/5
- Critical thinking: 2/5 (accepted most AI suggestions)

**Bonus:** +3
- Found 1 buggy test, mentioned missing coverage

**Total: 65/100 - Borderline (needs additional assessment)**

---

### Example 4: No Hire (48 points)

**Part 1:** 10/20
- Setup: 3/5
- PRD: 3/5 (superficial understanding)
- Data issues: 4/10 (found 1 issue)

**Part 2:** 25/60
- Price calculation: 15/35 (basic approach, doesn't handle edge cases)
- Booking creation: 5/15 (hardcoded values, doesn't work)
- CRUD: 5/10 (incomplete)

**Part 3:** 8/20
- Issue identification: 4/10 (found 1-2 issues)
- Prioritization: 2/5
- Critical thinking: 2/5

**Bonus:** +5
- Reviewed tests but didn't find issues

**Total: 48/100 - No Hire**

---

## Calibration Guidelines

### If Most Candidates Score >85:
Interview is too easy. Consider:
- Adding more complex requirements (e.g., handle hourly AND daily rate types)
- Removing some hints in comments
- Adding time pressure
- Requiring more complete test coverage

### If Most Candidates Score <60:
Interview is too hard. Consider:
- Providing more scaffolding in bookings.js
- Simplifying price calculation requirements
- Extending time limits
- Adding more hints during interview

### Target Distribution:
- **10%** - Exceptional (90-100)
- **30%** - Strong (80-89)
- **40%** - Good (70-79)
- **15%** - Borderline (55-69)
- **5%** - Not Ready (<55)

---

## Special Considerations

### Fast Finishers
If candidate completes core tasks early (< 90 min), offer stretch goals:
- Implement UPDATE and DELETE for properties
- Add rate overlap detection to rates.js
- Refactor price calculation into shared utility
- Write a data quality check script

Award bonus points for stretch goals completed well.

### Stuck Candidates
If candidate is stuck for >5 min:
- Offer hints (but note this in evaluation)
- Ask guiding questions from FOLLOW_UP_QUESTIONS.md
- Consider partial credit for thought process even if implementation incomplete

### Senior vs Staff Engineer Expectations
For **Staff Engineer** candidates, expect:
- Score: 85-95+
- Proactive identification of system design issues
- Consideration of scale, monitoring, observability
- Discussion of trade-offs without prompting
- Mentoring approach when explaining solutions

---

## Final Decision Matrix

Use this matrix as a guide, not a strict rule. Consider:
- Score
- Problem-solving approach
- Communication skills
- Cultural fit
- Team needs

| Score | Technical | Communication | Problem-Solving | Decision |
|-------|-----------|---------------|-----------------|----------|
| 90-100 | Excellent | Good+ | Excellent | **Strong Hire** |
| 80-89 | Good | Good+ | Good | **Hire** |
| 70-79 | Good | Acceptable | Good | **Hire** (if team fit) |
| 60-69 | Acceptable | Good | Acceptable | **Additional Assessment** |
| 55-59 | Acceptable | Acceptable | Weak | **Likely No Hire** |
| <55 | Weak | Any | Any | **No Hire** |

---

## Post-Interview Checklist

After scoring, ask yourself:

- [ ] Would I want this person on my team?
- [ ] Would I trust them with critical production issues?
- [ ] Did they demonstrate learning and adaptability?
- [ ] Were they collaborative and communicative?
- [ ] Did they ask good clarifying questions?
- [ ] How did they handle getting stuck?
- [ ] Did they test their work?
- [ ] Would they raise the bar for the team?

If most answers are "yes," lean toward hire even if score is borderline.
If most answers are "no," be cautious even if score is decent.

---

**Remember:** The score is a tool, not a replacement for judgment. Use it to calibrate and justify decisions, but trust your assessment of the candidate's overall fit and potential.
