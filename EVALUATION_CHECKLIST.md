# Interview Evaluation Checklist

**Candidate:** ___________________________
**Interviewer:** __________________________
**Date:** _________________________________

**Instructions:** Check off items as the candidate completes them. Score each section. Add notes for justification.

---

## Part 1: Setup & Exploration (20 points) - Target: 15-18 points

### Environment Setup (5 points)

- [ ] **5 pts:** Setup complete in < 5 min, reads docs first
- [ ] **4 pts:** Setup in 5-10 min, minor issues
- [ ] **3 pts:** Setup in 10-15 min, needs guidance
- [ ] **2 pts:** Struggles significantly
- [ ] **0-1 pts:** Cannot complete setup

**Score: _____ / 5**

**Notes:**
```


```

---

### PRD Comprehension (5 points)

- [ ] Reads PRD before starting
- [ ] Explains entity hierarchy correctly (Properties → Room Types → Units)
- [ ] Understands rates are at Room Type level
- [ ] Asks clarifying questions about business rules

- [ ] **5 pts:** Clear understanding, insightful questions
- [ ] **4 pts:** Good understanding
- [ ] **3 pts:** Basic understanding, needs prompting
- [ ] **2 pts:** Superficial understanding
- [ ] **0-1 pts:** Doesn't comprehend domain

**Score: _____ / 5**

**Notes:**
```


```

---

### Data Quality Analysis (10 points)

**Did they find these issues?**

- [ ] **Executive Office** - Missing Q2 rates (April-June gap)
- [ ] **Meeting Room Large** - No rates at all
- [ ] **Collaboration Space** - Missing H2 rates (July-Dec)
- [ ] **Private Office** - Overlapping date ranges

**Can they explain business impact?**
- [ ] Explains revenue loss from missing rates
- [ ] Identifies customer experience issues
- [ ] Suggests validation to prevent overlaps

- [ ] **9-10 pts:** Finds all 4 issues + explains impact
- [ ] **7-8 pts:** Finds 3-4 issues
- [ ] **5-6 pts:** Finds 2 issues
- [ ] **3-4 pts:** Finds 1 issue
- [ ] **0-2 pts:** Finds 0 issues

**Score: _____ / 10**

**Notes:**
```


```

---

## Part 2: Implementation (60 points) - Target: 45-52 points

### Price Calculation - /calculate-price (35 points)

#### Core Algorithm (20 points)

**Does it work for these scenarios?**

- [ ] **Test 1:** Simple Q1 booking (unit_dt_exec_001, Feb 1-11) → $1,500
- [ ] **Test 2:** Missing rates (unit_dt_exec_001, Apr 1-10) → Error
- [ ] **Test 3:** No rates (unit_dt_meet_001, Feb 1-10) → Error

**Implementation quality:**
- [ ] Finds unit correctly
- [ ] Gets room type from unit
- [ ] Queries rates by room_type_id
- [ ] Filters rates by date range
- [ ] Calculates price day-by-day (or similar algorithm)
- [ ] Returns price breakdown

- [ ] **18-20 pts:** Exceptional - handles all cases, clean code
- [ ] **15-17 pts:** Good - works for all test cases
- [ ] **12-14 pts:** Acceptable - works for basic cases
- [ ] **8-11 pts:** Needs work - algorithm flawed
- [ ] **0-7 pts:** Insufficient - doesn't work

**Score: _____ / 20**

---

#### Error Handling (10 points)

- [ ] Validates required fields (unit_id, start_date, end_date)
- [ ] Validates date format
- [ ] Validates start_date < end_date
- [ ] Returns 404 for non-existent unit
- [ ] Returns 400 for missing rates with clear message
- [ ] Error messages include helpful details

- [ ] **9-10 pts:** Comprehensive error handling
- [ ] **7-8 pts:** Handles most edge cases
- [ ] **5-6 pts:** Basic error handling
- [ ] **3-4 pts:** Minimal error handling
- [ ] **0-2 pts:** No error handling

**Score: _____ / 10**

---

#### Code Quality (5 points)

- [ ] Clean, readable code
- [ ] Good variable names
- [ ] Logical structure
- [ ] No obvious bugs
- [ ] Comments for complex logic

- [ ] **5 pts:** Production-ready quality
- [ ] **4 pts:** Good quality
- [ ] **3 pts:** Works but messy
- [ ] **2 pts:** Hard to follow
- [ ] **0-1 pts:** Very poor quality

**Score: _____ / 5**

**Notes:**
```


```

---

### Booking Creation - POST /bookings (15 points)

- [ ] Integrates price calculation
- [ ] Checks unit exists
- [ ] Checks unit availability (status = 'available')
- [ ] Returns error if rates missing
- [ ] Creates booking with calculated_price
- [ ] Returns created booking

- [ ] **13-15 pts:** Complete, correct implementation
- [ ] **10-12 pts:** Working, minor issues
- [ ] **7-9 pts:** Partial implementation
- [ ] **4-6 pts:** Basic structure only
- [ ] **0-3 pts:** Not working

**Score: _____ / 15**

**Notes:**
```


```

---

### CRUD - Properties POST (10 points)

- [ ] Uses validateProperty()
- [ ] Generates property_id
- [ ] Inserts into database
- [ ] Returns 201 status
- [ ] Returns created property
- [ ] Completed in < 20 min

- [ ] **9-10 pts:** Complete, fast, correct
- [ ] **7-8 pts:** Working implementation
- [ ] **5-6 pts:** Partial or slow
- [ ] **3-4 pts:** Incomplete
- [ ] **0-2 pts:** Not attempted

**Score: _____ / 10**

**Notes:**
```


```

---

## Part 3: AI-Assisted Review (20 points) - Target: 14-17 points

### Issue Identification (10 points)

**Critical issues found:**
- [ ] Missing rate overlap validation (rates.js:70, 105)
- [ ] No error handling in sync (rates.js:158)
- [ ] Invalid date not validated (rates.js:51)

**High priority found:**
- [ ] Currency validation too lenient (validation.js:23)
- [ ] Inefficient query loads all rates (rates.js:16)

**Code quality found:**
- [ ] Code duplication in bookings
- [ ] Missing referential integrity checks

- [ ] **9-10 pts:** Finds most issues across all levels
- [ ] **7-8 pts:** Finds all critical issues
- [ ] **5-6 pts:** Finds 2-3 critical issues
- [ ] **3-4 pts:** Finds 1-2 issues
- [ ] **0-2 pts:** Finds 0-1 issues

**Score: _____ / 10**

---

### Prioritization & Recommendations (5 points)

- [ ] Prioritizes by business impact
- [ ] Explains why each issue matters
- [ ] Proposes specific fixes (not vague)
- [ ] Provides code examples for fixes

- [ ] **5 pts:** Excellent prioritization + specific fixes
- [ ] **4 pts:** Good prioritization, clear proposals
- [ ] **3 pts:** Basic prioritization
- [ ] **2 pts:** Poor prioritization
- [ ] **0-1 pts:** No prioritization

**Score: _____ / 5**

---

### Critical Thinking (5 points)

- [ ] Questions AI suggestions (doesn't blindly accept)
- [ ] Identifies false positives (e.g., auth for dev project)
- [ ] Considers context and trade-offs
- [ ] Distinguishes critical vs nice-to-have

- [ ] **5 pts:** Exceptional critical evaluation
- [ ] **4 pts:** Good critical thinking
- [ ] **3 pts:** Some critical thinking
- [ ] **2 pts:** Mostly accepts AI blindly
- [ ] **0-1 pts:** No critical evaluation

**Score: _____ / 5**

**Notes:**
```


```

---

## Bonus: Test Review (+10 points)

### Buggy Tests Found (5 points)

- [ ] Invalid currency accepted (rates.test.js:47)
- [ ] Overlapping rates allowed (rates.test.js:77)
- [ ] Invalid date ignored (rates.test.js:117)
- [ ] Wrong rate type logic (bookings.test.js:38)
- [ ] Missing rates return $0 (bookings.test.js:69)
- [ ] Non-existent unit returns $0 (bookings.test.js:94)
- [ ] Price unchanged when dates change (bookings.test.js:144)
- [ ] Hard delete instead of soft (bookings.test.js:169)

**Score: _____ / 5** (1 pt per 2 tests found, max 5)

---

### Missing Coverage Identified (3 points)

- [ ] Multi-rate period calculations
- [ ] Monthly rate type handling
- [ ] Double-booking prevention
- [ ] Currency consistency
- [ ] Unit status updates

**Score: _____ / 3** (1 pt per scenario identified)

---

### PRD Alignment (2 points)

- [ ] Explains why tests conflict with PRD
- [ ] References specific PRD requirements

**Score: _____ / 2**

---

## Behavioral Observations

### Communication (Not scored, but note)

- [ ] Thinks out loud
- [ ] Asks clarifying questions
- [ ] Explains trade-offs
- [ ] Responds well to feedback
- [ ] Collaborative tone

**Notes:**
```


```

---

### Problem-Solving (Not scored, but note)

- [ ] Plans before coding
- [ ] Tests their work
- [ ] Handles getting stuck gracefully
- [ ] Identifies edge cases
- [ ] Iterates based on feedback

**Notes:**
```


```

---

### Red Flags (Check any that apply)

- [ ] Doesn't read documentation
- [ ] Defensive about feedback
- [ ] Doesn't test code
- [ ] Can't explain their implementation
- [ ] Dismisses edge cases
- [ ] Blames tools/framework
- [ ] Gives up easily

**Notes:**
```


```

---

## Final Scoring

| Section | Score | Max | % |
|---------|-------|-----|---|
| **Part 1: Setup & Exploration** | _____ | 20 | ___% |
| **Part 2: Implementation** | _____ | 60 | ___% |
| **Part 3: AI Review** | _____ | 20 | ___% |
| **Bonus: Test Review** | _____ | 10 | ___% |
| **TOTAL** | _____ | 100 | ___% |

---

## Decision Matrix

**Score Interpretation:**
- **90-100:** Exceptional → **Strong Hire**
- **80-89:** Strong → **Hire**
- **70-79:** Good → **Hire** (if communication + fit good)
- **60-69:** Borderline → **Additional Assessment Needed**
- **55-59:** Below bar → **Likely No Hire**
- **< 55:** Not ready → **No Hire**

---

## Overall Recommendation

**Rating:**
- [ ] **Strong Hire** (90-100 pts)
- [ ] **Hire** (70-89 pts)
- [ ] **No Hire** (<70 pts or major red flags)
- [ ] **Unsure** (need to discuss with team)

---

## Justification

**Top 3 Strengths:**
1.
2.
3.

**Top 3 Concerns:**
1.
2.
3.

**Would you want this person on your team? Why or why not?**

```




```

**Compared to other candidates at this level, how do they rank?**

```



```

**Any other notes:**

```




```

---

**Interviewer Signature:** _________________________
**Date:** _________________________
