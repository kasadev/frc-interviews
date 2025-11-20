/**
 * Price Calculation Test Suite (TDD Starter)
 *
 * This is a MINIMAL test suite to get you started with Test-Driven Development.
 *
 * YOUR TASK:
 * 1. Make these basic tests pass by implementing the price calculation logic
 * 2. Add MORE test cases to cover edge cases and advanced scenarios
 * 3. Ensure comprehensive coverage of the requirements in PRD.md FR-4
 *
 * WHAT'S PROVIDED:
 * - 3 basic happy-path tests to guide your initial implementation
 * - Test structure and patterns to follow
 *
 * WHAT'S MISSING (you should add):
 * - Edge cases (invalid inputs, missing data, etc.)
 * - Multi-period bookings (rate changes mid-booking)
 * - Rate gap scenarios (missing rates for some dates)
 * - Multiple rate types (hourly vs daily vs monthly)
 * - Advanced features (discounts, minimum stay, etc.)
 * - Error handling scenarios
 * - Boundary conditions
 *
 * See INTERVIEW_TEST_SCENARIOS.md for ideas on what to test.
 */

const request = require('supertest');
const app = require('../server');
const db = require('../src/db/db');

describe('Price Calculation Engine', () => {
  beforeEach(async () => {
    // Reset database to known state before each test
    await db.seed();
  });

  describe('POST /api/bookings/calculate-price - Basic Scenarios', () => {
    /**
     * Test 1: Simple single-period booking
     * This is the most basic case - a booking within one rate period
     */
    it('should calculate price for a single-period booking', async () => {
      const priceRequest = {
        unit_id: 'unit_exec_dt_101',
        start_date: '2025-01-15',
        end_date: '2025-01-20' // 5 nights in Q1
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_price).toBe(750); // 5 nights × $150/day
      expect(response.body.data.currency).toBe('USD');

      // Check breakdown structure
      expect(response.body.data.breakdown).toBeDefined();
      expect(response.body.data.breakdown).toBeInstanceOf(Array);
      expect(response.body.data.breakdown.length).toBe(1); // Single period
    });

    /**
     * Test 2: Invalid unit ID
     * Tests basic error handling
     */
    it('should return 404 when unit does not exist', async () => {
      const priceRequest = {
        unit_id: 'invalid_unit_id',
        start_date: '2025-01-15',
        end_date: '2025-01-20'
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNIT_NOT_FOUND');
      expect(response.body.error.message).toBeDefined();
    });

    /**
     * Test 3: Invalid date range
     * Tests input validation
     */
    it('should return 400 when end_date is before start_date', async () => {
      const priceRequest = {
        unit_id: 'unit_exec_dt_101',
        start_date: '2025-01-20',
        end_date: '2025-01-15' // End before start!
      };

      const response = await request(app)
        .post('/api/bookings/calculate-price')
        .send(priceRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBeDefined();
    });
  });

  describe('TODO: Multi-Period Bookings', () => {
    /**
     * TODO: Add tests for bookings that span multiple rate periods
     *
     * Example scenarios to test:
     * - Booking from Q1 into Q2 (rate change at quarter boundary)
     * - Booking from Q1 into H2 (spanning the rate gap in Q2)
     * - Ensure breakdown shows each period separately
     * - Verify date math is correct (no off-by-one errors)
     *
     * Hint: Use unit_exec_dt_101 (Executive Office) which has:
     * - Q1 (Jan-Mar): $150/day
     * - Q2 (Apr-Jun): $160/day (newly added)
     * - H2 (Jul-Dec): $175/day
     */

    it.todo('should calculate price for booking spanning two rate periods');

    it.todo('should calculate price for booking spanning multiple rate periods');

    it.todo('should handle rate boundaries correctly (no off-by-one errors)');
  });

  describe('TODO: Rate Gap Handling', () => {
    /**
     * TODO: Add tests for missing rate scenarios
     *
     * The seed data intentionally has gaps. Test how your implementation handles:
     * - Complete rate gap (no rates at all for the period)
     * - Partial rate gap (some coverage, but not complete)
     *
     * Questions to consider:
     * - Should you fail the entire request?
     * - Should you return partial pricing with warnings?
     * - Should you show which periods are covered vs missing?
     *
     * Hint: Try booking rt_exec_office_dt for dates that don't have rates
     */

    it.todo('should return error when no rate exists for booking period');

    it.todo('should handle partial rate coverage appropriately');
  });

  describe('TODO: Multiple Rate Types', () => {
    /**
     * TODO: Add tests for different rate types (hourly, daily, monthly)
     *
     * Some room types have multiple rate types available:
     * - Hot Desk (rt_hot_desk_dt): hourly $15, daily $50, monthly $800
     *
     * Questions to test:
     * - Which rate type is selected for a given booking duration?
     * - Does your implementation respect the rate_selection_strategy?
     * - For a 45-day booking, do you use daily or monthly rates?
     * - Can you show pricing alternatives?
     *
     * Hint: Check room_type.pricing_config.rate_selection_strategy
     */

    it.todo('should use daily rate for multi-day bookings');

    it.todo('should optimize rate selection based on pricing_config strategy');

    it.todo('should use monthly rates when appropriate (30+ days)');
  });

  describe('TODO: Advanced Features', () => {
    /**
     * TODO: Add tests for advanced features if you implement them
     *
     * Optional advanced features:
     * - Length-of-stay discounts (see pricing_config.length_of_stay_discounts)
     * - Minimum stay validation (see pricing_config.minimum_stay_nights)
     * - Weekend pricing premiums (see pricing_config.weekend_pricing)
     * - Rate overlap detection
     */

    it.todo('should apply length-of-stay discount for 30+ night bookings');

    it.todo('should enforce minimum stay requirements');

    it.todo('should detect overlapping rates and handle appropriately');
  });

  describe('TODO: Input Validation', () => {
    /**
     * TODO: Add comprehensive input validation tests
     *
     * Test edge cases:
     * - Missing required fields
     * - Invalid date formats
     * - Same-day bookings (start_date === end_date)
     * - Far-future dates (no rates configured)
     * - Past dates
     */

    it.todo('should return 400 when unit_id is missing');

    it.todo('should return 400 when dates are missing');

    it.todo('should return 400 for invalid date format');

    it.todo('should handle same-day bookings correctly');
  });

  describe('TODO: Response Format Validation', () => {
    /**
     * TODO: Add tests to verify response structure
     *
     * Ensure your response matches the format in PRD.md:
     * - total_price (number)
     * - currency (string)
     * - booking_details (object with unit info)
     * - breakdown (array of period calculations)
     * - Any additional fields (discounts, warnings, etc.)
     */

    it.todo('should return response in correct format per PRD');

    it.todo('should include detailed breakdown for multi-period bookings');

    it.todo('should include discount information when applicable');
  });
});

/**
 * TESTING TIPS:
 *
 * 1. Use descriptive test names that explain the scenario
 * 2. Follow the Arrange-Act-Assert pattern
 * 3. Test one thing per test (don't mix multiple assertions)
 * 4. Use .only() to focus on specific tests while developing
 * 5. Use .skip() to temporarily disable failing tests
 * 6. Check both happy paths and error cases
 * 7. Test boundary conditions (0 days, 1 day, 30 days, etc.)
 * 8. Verify error messages are helpful and actionable
 *
 * Run tests with:
 *   npm test                          # Run all tests
 *   npm test price-calculation        # Run this file only
 *   npm test -- --watch              # Watch mode
 */
