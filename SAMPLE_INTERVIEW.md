# Sample Interview Walkthrough

This document shows a realistic interview with a **good candidate** (target: 80% completion) including their thought process, code, and how an interviewer should respond.

---

## Candidate Profile: Alex Chen
- 5 years experience as a software engineer
- Strong backend skills with Node.js
- Has worked with REST APIs and rate management systems
- Target outcome: Hire (70-84 points)

---

## Part 1: Setup & Exploration (18 minutes)

### Minute 0-5: Initial Setup

**Interviewer:** "Thanks for joining, Alex! We're going to work with StayRate, a rate management system. The repo link is in the chat. Could you start by cloning it and getting it running?"

**Alex:** "Sure! Let me clone it..."

```bash
git clone <repo>
cd frc-interview
cat README.md  # Reads setup instructions
```

**Alex:** "I see it's a Node.js app. Let me install dependencies and start it."

```bash
npm install
npm start
```

**Alex:** "Great, it's running on port 3000. Let me verify with the health check."

```bash
curl http://localhost:3000/health
# {"success":true,"data":{"status":"healthy",...}}
```

**Interviewer Notes:** ✅ Efficient setup, reads documentation first
**Score: 5/5 points**

---

### Minute 5-10: Understanding the Domain

**Alex:** "Let me read the PRD to understand what we're building..."

*Alex spends 3 minutes reading PRD.md*

**Alex:** "Okay, so this is a rate management system for hospitality spaces. The hierarchy is Properties → Room Types → Units, and we price at the Room Type level. Rates have date ranges and can be hourly, daily, or monthly."

**Interviewer:** "Correct! Can you explain what makes this different from just storing a single price per room type?"

**Alex:** "Sure. The date ranges allow dynamic pricing - you might charge more in Q4 than Q1. And having different rate types (hourly vs daily vs monthly) gives customers flexibility. It's similar to hotel revenue management."

**Interviewer Notes:** ✅ Demonstrates business understanding
**Score: 5/5 points**

---

### Minute 10-18: Data Exploration

**Alex:** "Let me explore the APIs and data..."

```bash
# Check what's in the system
curl http://localhost:3000/api/properties | jq
curl http://localhost:3000/api/room-types | jq
curl http://localhost:3000/api/rates | jq
```

**Alex:** "I see 2 properties, 5 room types, and about 12 rates. Let me check for data issues..."

*Alex opens `src/db/seed.js` and reviews the data*

**Alex:** "I found several data quality issues:

1. **Executive Office (Downtown Hub)** - Has rates for Q1 and H2, but nothing for Q2 (April-June). That's a 3-month gap.

2. **Meeting Room Large** - Has NO rates at all! That's a bigger problem because you can't book it.

3. **Collaboration Space (Tech Campus)** - Has H1 rates but missing H2 rates (July-Dec).

4. **Private Office (Tech Campus)** - Has overlapping rates. Look at this:"

```javascript
// Rate 1: Jan 1 - June 30
// Rate 2: June 15 - Sept 30  // Overlaps!
```

**Alex:** "This is ambiguous - which rate applies from June 15-30?"

**Interviewer:** "Excellent finds! What would be the business impact of these issues?"

**Alex:** "The missing rates mean customers can't book during those periods, which is lost revenue. The overlapping rates could cause pricing inconsistencies - two customers might get different quotes for the same dates. This should be caught by validation."

**Interviewer Notes:** ✅ Found all major data issues, explained business impact
**Score: 5/5 points**

---

## Part 2: Implementation (68 minutes)

### Task 1: Implement Price Calculation (50 minutes)

**Interviewer:** "Great exploration. Now let's implement the core feature: booking price calculation. Open `src/routes/bookings.js` and look at the `/calculate-price` endpoint."

**Alex:** *Reads the TODO comments* "So I need to calculate the price for a booking by finding the applicable rates for the room type and date range. Let me think through the algorithm..."

**Alex:** "My approach:
1. Validate inputs
2. Find the unit and get its room type
3. Query rates for that room type
4. Filter rates that overlap with the booking dates
5. Calculate price based on duration and rate amount
6. Handle missing rates with a clear error

Questions:
- Should I handle bookings that span multiple rate periods?
- Which rate type should I prioritize - daily, hourly, or monthly?
- For simplicity, should I assume full-day bookings?"

**Interviewer:** "Good questions! Yes, handle multiple rate periods. For rate type selection, let's keep it simple: use daily rates, and assume full-day bookings."

**Alex:** "Got it. Let me start coding..."

---

#### Implementation: Calculate Price Endpoint

**Alex's Code:**

```javascript
router.post('/calculate-price', async (req, res, next) => {
  try {
    const { unit_id, start_date, end_date } = req.body;

    // Validate required fields
    if (!unit_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'unit_id, start_date, and end_date are required',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }

    // Validate date format and order
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        }
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'start_date must be before end_date',
          code: 'INVALID_DATE_RANGE'
        }
      });
    }

    // Find unit
    const unit = await db.findById('units', unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit not found',
          code: 'UNIT_NOT_FOUND'
        }
      });
    }

    // Find room type
    const roomType = await db.findById('room_types', unit.room_type_id);
    if (!roomType) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Room type not found for unit',
          code: 'ROOM_TYPE_NOT_FOUND'
        }
      });
    }

    // Find applicable rates (daily rate type only for simplicity)
    const allRates = await db.find('rates', {
      room_type_id: unit.room_type_id,
      rate_type: 'daily'
    });

    // Filter rates that overlap with booking period
    const applicableRates = allRates.filter(rate => {
      const rateStart = new Date(rate.effective_date);
      const rateEnd = new Date(rate.end_date);

      // Check if rate period overlaps with booking period
      return (rateStart <= endDate && rateEnd >= startDate);
    });

    if (applicableRates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No rates available for the requested booking period',
          code: 'NO_RATES_AVAILABLE',
          details: {
            room_type_id: unit.room_type_id,
            start_date,
            end_date
          }
        }
      });
    }

    // Calculate price
    let totalPrice = 0;
    const breakdown = [];
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      // Find applicable rate for current date
      const rate = applicableRates.find(r => {
        const rateStart = new Date(r.effective_date);
        const rateEnd = new Date(r.end_date);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (!rate) {
        return res.status(400).json({
          success: false,
          error: {
            message: `No rate available for date ${currentDate.toISOString().split('T')[0]}`,
            code: 'RATE_GAP',
            details: {
              missing_date: currentDate.toISOString().split('T')[0]
            }
          }
        });
      }

      // Add one day's charge
      totalPrice += rate.amount;

      // Track in breakdown
      const existingPeriod = breakdown.find(b => b.rate_id === rate.rate_id);
      if (existingPeriod) {
        existingPeriod.days++;
        existingPeriod.subtotal += rate.amount;
      } else {
        breakdown.push({
          rate_id: rate.rate_id,
          rate_amount: rate.amount,
          currency: rate.currency,
          effective_date: rate.effective_date,
          end_date: rate.end_date,
          days: 1,
          subtotal: rate.amount
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: {
        unit_id,
        room_type_id: unit.room_type_id,
        room_type_name: roomType.name,
        start_date,
        end_date,
        total_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
        calculated_price: totalPrice,
        currency: applicableRates[0].currency,
        breakdown
      }
    });

  } catch (error) {
    next(error);
  }
});
```

**Alex:** "Let me test this..."

```bash
# Test 1: Simple booking in Q1
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "unit_dt_exec_001",
    "start_date": "2025-02-01",
    "end_date": "2025-02-11"
  }'

# Response: 1500.00 (10 days * $150/day) ✓
```

```bash
# Test 2: Booking with missing rates (Q2 gap)
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "unit_dt_exec_001",
    "start_date": "2025-04-01",
    "end_date": "2025-04-10"
  }'

# Response: Error "No rates available" ✓
```

```bash
# Test 3: Booking spanning multiple rate periods
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "unit_dt_exec_001",
    "start_date": "2025-03-25",
    "end_date": "2025-07-05"
  }'

# Response: Error "Rate gap" for dates in Q2 ✓
```

**Interviewer:** "Good! Your implementation correctly handles the missing rates. What about the overlapping rates issue we found in the Private Office?"

**Alex:** "Ah, good point. Let me test that..."

```bash
curl -X POST http://localhost:3000/api/bookings/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "unit_tc_office_001",
    "start_date": "2025-06-20",
    "end_date": "2025-06-25"
  }'
```

**Alex:** "Hmm, my code uses `.find()` which returns the first match. For overlapping rates, this could return inconsistent results. In production, I'd want to either:
1. Validate and prevent overlapping rates at creation time
2. Add a priority field to rates
3. Use the most recent rate by creation timestamp

For now, my code will at least be deterministic - it uses the first rate found."

**Interviewer Notes:**
- ✅ Correct algorithm for price calculation
- ✅ Handles missing rates with clear errors
- ✅ Provides detailed breakdown
- ✅ Good error handling and validation
- ⚠️ Didn't fully resolve overlapping rates (minor issue)
- ✅ Tests implementation thoroughly
- ✅ Identified limitation with overlapping rates

**Score: 35/40 points** (Minor deduction for not fully handling overlaps)

---

#### Implementation: Create Booking with Price Calculation

**Alex:** "Now let me update the POST /api/bookings endpoint to use this logic..."

```javascript
router.post('/', async (req, res, next) => {
  try {
    const bookingData = req.body;

    // Validate input
    const validation = validateBooking(bookingData);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // Check if unit exists
    const unit = await db.findById('units', bookingData.unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Unit not found',
          code: 'UNIT_NOT_FOUND'
        }
      });
    }

    // Check unit availability
    if (unit.status !== 'available') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unit is not available for booking',
          code: 'UNIT_NOT_AVAILABLE',
          details: {
            current_status: unit.status
          }
        }
      });
    }

    // Calculate price using the same logic as /calculate-price
    const roomType = await db.findById('room_types', unit.room_type_id);
    const allRates = await db.find('rates', {
      room_type_id: unit.room_type_id,
      rate_type: 'daily'
    });

    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);

    const applicableRates = allRates.filter(rate => {
      const rateStart = new Date(rate.effective_date);
      const rateEnd = new Date(rate.end_date);
      return (rateStart <= endDate && rateEnd >= startDate);
    });

    if (applicableRates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot create booking: No rates available for the requested period',
          code: 'NO_RATES_AVAILABLE'
        }
      });
    }

    // Calculate total price
    let calculated_price = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const rate = applicableRates.find(r => {
        const rateStart = new Date(r.effective_date);
        const rateEnd = new Date(r.end_date);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (!rate) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Cannot create booking: Rate gap on ${currentDate.toISOString().split('T')[0]}`,
            code: 'RATE_GAP'
          }
        });
      }

      calculated_price += rate.amount;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create booking
    const booking = {
      booking_id: `book_${uuidv4()}`,
      ...bookingData,
      calculated_price,
      currency: applicableRates[0].currency,
      status: 'pending'
    };

    await db.insert('bookings', booking);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});
```

**Alex:** "I duplicated some logic here. In a real codebase, I'd extract the price calculation into a shared utility function."

**Interviewer:** "Good observation! Let's keep it as-is for time, but you're right about the refactoring."

**Interviewer Notes:**
- ✅ Successfully implements booking creation with price calculation
- ✅ Reuses same calculation logic
- ✅ Identifies code duplication (would refactor in production)

**Time elapsed: 50 minutes**

---

### Task 2: Implement Properties CRUD (15 minutes)

**Interviewer:** "Great work! Now let's implement one of the scaffolded endpoints. Could you implement POST /api/properties?"

**Alex:** "Sure, let me look at the rates.js file as a reference..."

*Alex opens rates.js and properties.js side by side*

**Alex:** "I see the pattern. Let me implement it..."

```javascript
router.post('/', async (req, res, next) => {
  try {
    const propertyData = req.body;

    // Validate input using validateProperty
    const validation = validateProperty(propertyData);
    if (!validation.valid) {
      throw createValidationError(validation.errors);
    }

    // Generate property_id
    const property = {
      property_id: `prop_${uuidv4()}`,
      ...propertyData,
      status: propertyData.status || 'active' // Default to active
    };

    // Insert into database
    await db.insert('properties', property);

    // Return created property
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
});
```

**Alex:** "Let me test it..."

```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Innovation Hub",
    "address": "789 Startup Lane, Austin, TX",
    "timezone": "America/Chicago",
    "status": "active"
  }'

# Response: Success with new property_id ✓
```

**Interviewer Notes:**
- ✅ Follows existing patterns correctly
- ✅ Uses validation utilities
- ✅ Tests implementation
- ✅ Completed quickly (12 minutes)

**Score: 18/20 points** (Minor: could have implemented UPDATE/DELETE as well, but not required)

---

## Part 3: AI-Assisted Code Review (20 minutes)

**Interviewer:** "Excellent! Now for the final part: use an AI assistant to review the codebase for bugs, security issues, and code quality problems. You have 20 minutes."

**Alex:** "Great, let me use ChatGPT for this..."

*Alex copies relevant code files into ChatGPT*

**Alex's Prompt to ChatGPT:**
```
I'm reviewing a Node.js/Express rate management API. Please analyze this codebase for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Missing error handling
5. Code quality problems

Here's the rates.js file: [paste code]
Here's the validation.js file: [paste code]
Here's the bookings.js file: [paste code]
```

---

### Minute 5-15: AI Analysis

**Alex:** "ChatGPT found several issues. Let me prioritize them..."

*Alex creates a document*

---

### Alex's Findings (Prioritized)

#### **CRITICAL (Fix Immediately)**

**1. Missing Rate Overlap Validation** (rates.js:70, 105)

**What:** When creating or updating rates, there's no check for overlapping date ranges for the same room type.

**Why it matters:**
- Creates ambiguous pricing (which rate applies?)
- Leads to inconsistent customer quotes
- Could cause revenue leakage if wrong rate is applied
- We already have this bug in our seed data (Private Office)

**How to fix:**
```javascript
// Before inserting/updating, check for overlaps
const existingRates = await db.find('rates', {
  room_type_id: rateData.room_type_id,
  rate_type: rateData.rate_type
});

const hasOverlap = existingRates.some(existing => {
  const newStart = new Date(rateData.effective_date);
  const newEnd = new Date(rateData.end_date);
  const existingStart = new Date(existing.effective_date);
  const existingEnd = new Date(existing.end_date);

  return (newStart <= existingEnd && newEnd >= existingStart);
});

if (hasOverlap) {
  throw createValidationError(['Rate date range overlaps with existing rate']);
}
```

---

**2. No Error Handling in Sync Endpoint** (rates.js:158)

**What:** The `/api/rates/sync` endpoint reads a file without try-catch. If the file is missing or malformed JSON, the server could crash.

**Why it matters:**
- Server crashes = downtime
- No graceful degradation
- Poor user experience

**How to fix:**
```javascript
try {
  const fileContent = await fs.readFile(externalFilePath, 'utf-8');
  const externalRates = JSON.parse(fileContent);
  // ... rest of logic
} catch (error) {
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: {
        message: 'External rates file not found',
        code: 'SYNC_FILE_NOT_FOUND'
      }
    });
  }
  throw error; // Let error handler deal with other errors
}
```

---

**3. Invalid Date Not Validated in Rate Filter** (rates.js:51)

**What:** When filtering rates by date query param, invalid dates aren't validated before use.

**Why it matters:**
- Could return incorrect results
- Could cause crashes if date operations fail
- Poor user experience (no clear error message)

**How to fix:**
```javascript
if (date) {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT'
      }
    });
  }

  // ... rest of filtering logic
}
```

---

#### **HIGH (Fix Soon)**

**4. Currency Validation Too Lenient** (validation.js:23)

**What:** Currency field accepts any string, doesn't validate against ISO 4217 currency codes.

**Why it matters:**
- Data consistency issues
- Could store "dollars", "usd", "USD", "$" all meaning the same thing
- Makes reporting and calculations difficult

**How to fix:**
Add a currency whitelist and validate against it.

---

**5. Inefficient Query in GET /api/rates** (rates.js:16)

**What:** Loads all rates into memory even without filters. Could be slow with thousands of rates.

**Why it matters:**
- Performance degrades as data grows
- Memory usage grows unbounded
- Bad scalability

**How to fix:**
Add pagination with limit/offset query params.

---

#### **MEDIUM (Improve When Possible)**

**6. Code Duplication in Bookings**
- Price calculation logic is duplicated between `/calculate-price` and `/bookings`
- Should be extracted to a shared utility function

**7. No Referential Integrity Checks**
- Scaffolded DELETE operations don't check for dependent records
- Could orphan data (e.g., delete property that has room types)

**8. Race Conditions in File-Based DB**
- Concurrent writes could corrupt data
- Need file locking or atomic operations
- Document that this is for development only

---

**Alex:** "I'd fix the critical issues immediately, the high-priority issues before going to production, and the medium issues in the next sprint."

**Interviewer:** "Excellent analysis! I noticed you didn't mention authentication. Did the AI flag that?"

**Alex:** "Oh yes, it did! No authentication or authorization. But I assumed that's intentional for a local development interview project. In production, we'd need JWT auth, rate limiting, and API keys."

**Interviewer:** "Exactly right. Good critical thinking."

**Interviewer Notes:**
- ✅ Found all major intentional bugs
- ✅ Excellent prioritization by business impact
- ✅ Specific, actionable fixes with code examples
- ✅ Good understanding of trade-offs
- ✅ Critically evaluated AI suggestions (auth false positive)

**Score: 23/25 points**

---

## Part 4: Test Review (Bonus - 10 minutes)

**Interviewer:** "One more thing - we have some tests in the `/tests` folder. Could you quickly review them and tell me if you notice any issues?"

**Alex:** *Opens tests/rates.test.js and tests/bookings.test.js*

**Alex:** "Oh wow, there are bugs in the tests themselves! Let me document them..."

---

### Test Issues Found

**1. tests/rates.test.js:47 - Accepts Invalid Currency**
```javascript
it('should accept any currency code', async () => {
  // BUG: This test expects invalid currency to pass
  // But PRD says currency must be validated
  currency: 'INVALID_CURRENCY' // Should fail!
```

**Impact:** This test is wrong. Per the PRD, currency must be a valid ISO code. The test should expect a 400 error, not 201 success.

---

**2. tests/rates.test.js:77 - Allows Overlapping Rates**
```javascript
it('should allow creating overlapping rate periods', async () => {
  // BUG: PRD says overlapping rates should be rejected
  .expect(201); // Should be 400!
```

**Impact:** Test doesn't align with PRD requirements. Overlapping rates should be prevented.

---

**3. tests/rates.test.js:117 - Ignores Invalid Date**
```javascript
it('should ignore invalid date format', async () => {
  .get('/api/rates/room-type/rt_exec_office_dt?date=not-a-date')
  .expect(200); // Should be 400!
```

**Impact:** Test expects invalid input to be silently ignored. PRD says validation errors should return 400 with clear messages.

---

**4. tests/bookings.test.js:38 - Wrong Rate Type Priority**
```javascript
it('should use hourly rates for multi-day bookings', async () => {
  // BUG: PRD says use daily rates for multi-day bookings
  expect(response.body.data.calculated_price).toBe(15 * 24 * 4);
```

**Impact:** Test has wrong business logic. Daily rates should be used, not hourly.

---

**5. tests/bookings.test.js:69 - Accepts Missing Rates**
```javascript
it('should return zero price when rates are missing', async () => {
  .expect(200); // Should be 400!
  expect(calculated_price).toBe(0);
```

**Impact:** Test expects graceful degradation, but PRD says bookings without rates should fail with error.

---

**6. Missing Test Coverage**

The tests don't cover several PRD requirements:
- Price calculation spanning multiple rate periods
- Monthly rate type handling
- Double-booking prevention
- Unit status updates after booking

**Alex:** "In summary: 5 tests have incorrect expectations that conflict with the PRD, and we're missing coverage for several important scenarios. I'd fix the buggy tests first, then add the missing coverage."

**Interviewer:** "Perfect! That's exactly what we were looking for."

**Interviewer Notes:**
- ✅ Identified all buggy tests
- ✅ Explained why each test is wrong
- ✅ Referenced PRD requirements
- ✅ Identified missing coverage

**Bonus Score: +5 points**

---

## Final Interview Summary

### Total Score: 86/100 + 5 bonus = **91/100**

### Breakdown:
- **Part 1 - Setup & Exploration:** 15/15
  - Setup: 5/5
  - Domain understanding: 5/5
  - Data issue identification: 5/5

- **Part 2 - Implementation:** 53/60
  - Price calculation: 35/40 (minor issue with overlaps)
  - CRUD implementation: 18/20

- **Part 3 - AI Code Review:** 23/25
  - Issue identification: 10/10
  - Prioritization: 5/5
  - Fix proposals: 5/5
  - Critical evaluation: 3/5 (good, not exceptional)

- **Bonus - Test Review:** 5/5

### Interviewer Recommendation: **STRONG HIRE**

**Strengths:**
- Excellent problem-solving approach
- Strong technical skills with Node.js/Express
- Good business domain understanding
- Thoughtful about edge cases and production considerations
- Effective use of AI tools
- Identifies code smells and technical debt
- Communicates clearly and asks good questions

**Areas for Growth:**
- Could be more thorough with edge case handling (overlapping rates)
- Could think more about refactoring during implementation

**Team Fit:** Would excel on the Rates & Financials team. Ready for complex backend work.

---

## Interviewer Follow-up Questions Used

Throughout the interview, the interviewer asked:

1. "What makes this different from just storing a single price?" (Tests understanding)
2. "What would be the business impact of these data issues?" (Tests business thinking)
3. "Should you handle bookings that span multiple rate periods?" (Tests clarification)
4. "What about the overlapping rates issue?" (Tests attention to detail)
5. "Did the AI flag authentication?" (Tests critical thinking)
6. "Could you review the tests?" (Bonus challenge)

These questions revealed the candidate's depth of understanding and problem-solving approach.
