# Product Requirements Document: StayRate

## Executive Summary

StayRate is a rate management system for hospitality space operations. The system manages pricing for different room types across multiple properties, enabling efficient rate administration, synchronization with external pricing systems, and automated booking price calculations.

## Business Context

Our hospitality space company operates multiple properties with various room types (offices, desks, meeting rooms, etc.). Each room type has dynamic pricing that varies by date range and booking duration (hourly, daily, monthly). We need a centralized system to:

1. Manage rates across all properties and room types
2. Import rates from third-party revenue management systems
3. Calculate accurate booking prices based on applicable rates
4. Track inventory at the property, room type, and unit level

## System Overview

### Entity Hierarchy

```
Property (Building/Location)
  └── Room Type (Category: "Executive Office", "Hot Desk", etc.)
      ├── Units (Individual spaces)
      └── Rates (Pricing rules by date range)
```

### Core Entities

#### 1. Property
Represents a physical location/building.

**Attributes:**
- `property_id` (string): Unique identifier
- `name` (string): Property name
- `address` (string): Physical address
- `timezone` (string): Property timezone (e.g., "America/Los_Angeles")
- `status` (string): "active" | "inactive" | "maintenance"

#### 2. Room Type
Categories of rentable spaces within a property.

**Attributes:**
- `room_type_id` (string): Unique identifier
- `property_id` (string): Reference to parent property
- `name` (string): Room type name (e.g., "Executive Office")
- `description` (string): Detailed description
- `capacity` (number): Max occupancy
- `amenities` (array): List of included features

**Business Rules:**
- A room type belongs to exactly one property
- Room types are priced independently via the Rates entity

#### 3. Unit
Individual bookable spaces belonging to a room type.

**Attributes:**
- `unit_id` (string): Unique identifier
- `room_type_id` (string): Reference to parent room type
- `unit_number` (string): Human-readable identifier (e.g., "Office 101")
- `floor` (number): Floor number
- `status` (string): "available" | "occupied" | "maintenance" | "reserved"

**Business Rules:**
- A unit belongs to exactly one room type
- Units inherit pricing from their room type
- Multiple units of the same room type share the same rate schedule

#### 4. Rate
Pricing rules for room types within specific date ranges.

**Attributes:**
- `rate_id` (string): Unique identifier
- `room_type_id` (string): Reference to room type
- `rate_type` (string): "hourly" | "daily" | "monthly"
- `amount` (number): Price amount
- `currency` (string): Currency code (e.g., "USD")
- `effective_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)

**Business Rules:**
- Rates are defined at the room type level, not the unit level
- Rate date ranges should not overlap for the same room type and rate type
- A booking that spans multiple rate periods should be calculated using each applicable rate
- Missing rates should be handled gracefully (error or fallback logic)

#### 5. Booking
Customer reservations for units.

**Attributes:**
- `booking_id` (string): Unique identifier
- `unit_id` (string): Reference to booked unit
- `customer_name` (string): Customer name
- `customer_email` (string): Customer email
- `start_date` (string): Booking start (ISO format)
- `end_date` (string): Booking end (ISO format)
- `calculated_price` (number): Total booking price
- `currency` (string): Currency code
- `status` (string): "pending" | "confirmed" | "cancelled"

**Business Rules:**
- Price must be calculated using the room type's applicable rates
- If no rate exists for the booking period, the booking should fail with a clear error
- Price calculation should account for partial day/hour bookings

## Functional Requirements

### FR-1: Rate Management (Priority: P0)

**FR-1.1:** System shall support full CRUD operations for rates
- Create new rates with validation
- Retrieve rates by room type and date range
- Update existing rates
- Delete rates (soft delete preferred)

**FR-1.2:** System shall validate rate data
- Effective date must be before end date
- Amount must be positive
- Currency must be valid ISO code
- Rate type must be one of: hourly, daily, monthly

**FR-1.3:** System shall detect overlapping date ranges
- When creating/updating rates, check for overlaps within the same room type
- Return validation error if overlap detected

**FR-1.4:** System shall provide rate lookup by date
- Given a room type and date, return applicable rate
- Handle edge cases (no rate found, multiple rates)

### FR-2: External Rate Synchronization (Priority: P0)

**FR-2.1:** System shall provide a sync endpoint
- Endpoint: `POST /api/rates/sync`
- Reads rate data from external source (mocked as local file)
- Updates local rate database

**FR-2.2:** System shall handle sync conflicts
- If incoming rate conflicts with existing rate, apply business rules:
  - External system is source of truth (overwrite)
  - OR preserve local changes (skip)
  - Log all conflicts

### FR-3: Property & Inventory Management (Priority: P1)

**FR-3.1:** System shall support property CRUD operations
**FR-3.2:** System shall support room type CRUD operations
**FR-3.3:** System shall support unit CRUD operations
**FR-3.4:** System shall maintain referential integrity
- Cannot delete property if room types exist
- Cannot delete room type if units or bookings exist

### FR-4: Booking & Price Calculation (Priority: P0)

This is the core pricing engine for the system. The implementation should support multiple tiers of sophistication to handle real-world pricing complexity.

#### FR-4.1: Basic Price Calculation (REQUIRED)

**Endpoint:** `POST /api/bookings/calculate-price`

**Input:**
```json
{
  "unit_id": "unit_101",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20"
}
```

**Requirements:**
1. **Unit Resolution**: Find unit by ID and resolve its room_type_id
2. **Rate Lookup**: Find applicable rates for the room type that overlap with the booking period
3. **Date Range Validation**:
   - Dates must be valid ISO 8601 format
   - start_date must be before end_date
   - Handle timezone considerations (use UTC or property timezone)
4. **Missing Rate Handling**: Return clear error if no rate exists for any part of the booking period
5. **Basic Calculation**: For single rate period, calculate: `days × daily_rate`
6. **Response Format**: Return total price, currency, and breakdown of calculation

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total_price": 750.00,
    "currency": "USD",
    "booking_details": {
      "unit_id": "unit_101",
      "room_type": "Executive Office",
      "start_date": "2025-01-15",
      "end_date": "2025-01-20",
      "total_nights": 5
    },
    "breakdown": [
      {
        "period_start": "2025-01-15",
        "period_end": "2025-01-20",
        "days": 5,
        "rate_type": "daily",
        "rate_amount": 150.00,
        "subtotal": 750.00
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NO_RATE_AVAILABLE",
    "message": "No rate configured for the requested booking period",
    "details": {
      "missing_dates": ["2025-04-01 to 2025-06-30"],
      "room_type_id": "rt_exec_office_dt"
    }
  }
}
```

#### FR-4.2: Multi-Period Price Calculation (EXPECTED)

**Challenge:** Bookings often span multiple rate periods with different pricing

**Requirements:**
1. **Period Segmentation**: Split booking into sub-periods where rate changes occur
2. **Rate Period Detection**: Identify all rate changes within the booking date range
3. **Gap Detection**: Detect and report periods with no configured rates
4. **Accurate Date Math**:
   - Calculate exact days for each period
   - Handle edge cases (same-day boundaries, month-end transitions)
   - Consider rate effective_date as inclusive, end_date as inclusive
5. **Aggregation**: Sum all period subtotals for final price

**Example Scenario:**
- Booking: Jan 15 - Aug 15 (213 days)
- Room Type: rt_exec_office_dt
- Rates:
  - Q1 (Jan 1 - Mar 31): $150/day
  - Q2 (Apr 1 - Jun 30): **MISSING** (intentional gap in seed data)
  - H2 (Jul 1 - Dec 31): $175/day

**Expected Behavior:**
```json
{
  "success": false,
  "error": {
    "code": "INCOMPLETE_RATE_COVERAGE",
    "message": "Rate coverage is incomplete for the booking period",
    "details": {
      "covered_periods": [
        { "start": "2025-01-15", "end": "2025-03-31", "rate": 150.00 },
        { "start": "2025-07-01", "end": "2025-08-15", "rate": 175.00 }
      ],
      "missing_periods": [
        { "start": "2025-04-01", "end": "2025-06-30" }
      ],
      "partial_price": 19450.00,
      "coverage_percent": 57.7
    }
  }
}
```

#### FR-4.3: Rate Type Selection Strategy (ADVANCED)

**Challenge:** When multiple rate types exist (hourly, daily, monthly), which should be used?

**Room Type Configuration:**
Each room type has a `pricing_config.rate_selection_strategy`:
- `lowest_price`: Choose combination that minimizes total cost (customer-friendly)
- `prefer_monthly`: Use monthly rates when booking ≥ 30 days
- `prefer_daily`: Default to daily rates unless monthly saves significant money
- `prefer_hourly`: For short bookings (< 1 day)
- `single_rate_type`: Only one rate type allowed (e.g., meeting rooms are hourly-only)

**Example Scenario:**
- Room Type: rt_hot_desk_dt (has hourly, daily, monthly rates)
- Booking: 45 days
- Available rates:
  - Hourly: $15/hour
  - Daily: $50/day
  - Monthly: $800/month

**Calculation Options:**
1. **All Daily**: 45 days × $50 = $2,250
2. **Optimized**: 1 month ($800) + 15 days ($750) = $1,550 ✅ (30% savings)

**Requirements:**
1. Evaluate all valid rate type combinations
2. Apply strategy from room type configuration
3. Show cost comparison in response
4. Document why each rate type was chosen

**Response Example:**
```json
{
  "total_price": 1550.00,
  "strategy_used": "lowest_price",
  "breakdown": [
    {
      "period_start": "2025-01-01",
      "period_end": "2025-01-31",
      "duration_days": 31,
      "rate_type": "monthly",
      "rate_amount": 800.00,
      "subtotal": 800.00,
      "rationale": "Monthly rate selected (31 days ≥ 30 day threshold)"
    },
    {
      "period_start": "2025-02-01",
      "period_end": "2025-02-15",
      "duration_days": 15,
      "rate_type": "daily",
      "rate_amount": 50.00,
      "subtotal": 750.00,
      "rationale": "Daily rate selected (15 days < monthly threshold)"
    }
  ],
  "pricing_alternatives": {
    "all_daily": {
      "total": 2250.00,
      "savings_vs_selected": -700.00
    },
    "all_hourly": {
      "total": 16200.00,
      "savings_vs_selected": -14650.00,
      "note": "Not practical for multi-day bookings"
    }
  }
}
```

#### FR-4.4: Length-of-Stay Discounts (EXPERT)

**Challenge:** Apply tiered discounts based on booking duration to incentivize longer stays

**Room Type Configuration:**
Each room type has `pricing_config.length_of_stay_discounts`:
```json
{
  "length_of_stay_discounts": [
    { "min_nights": 7, "discount_percent": 5 },
    { "min_nights": 14, "discount_percent": 10 },
    { "min_nights": 30, "discount_percent": 15 },
    { "min_nights": 90, "discount_percent": 20 }
  ]
}
```

**Requirements:**
1. Calculate base price first (using rate selection strategy)
2. Determine applicable discount tier based on total nights
3. Apply highest applicable discount (not cumulative)
4. Show breakdown: base_price, discount_amount, final_price
5. Support optional `apply_discounts` flag in request (default: true)

**Discount Application Rules:**
- Discount applies to the **entire booking**, not per-period
- Use the **highest applicable tier** (e.g., 35 nights → 15% off, not 5% or 10%)
- If booking spans multiple rate periods with different prices, apply discount to total
- Discount percentages are configured per room type

**Response Example:**
```json
{
  "total_price": 3952.50,
  "base_price": 4650.00,
  "discount": {
    "type": "length_of_stay",
    "tier": "30+ nights",
    "percent": 15,
    "amount": 697.50
  },
  "breakdown": [
    {
      "period_start": "2025-01-01",
      "period_end": "2025-01-31",
      "days": 31,
      "rate_type": "daily",
      "rate_amount": 150.00,
      "base_subtotal": 4650.00,
      "discount_applied": 697.50,
      "final_subtotal": 3952.50
    }
  ],
  "discount_tiers_available": [
    { "min_nights": 7, "discount_percent": 5, "applied": false },
    { "min_nights": 14, "discount_percent": 10, "applied": false },
    { "min_nights": 30, "discount_percent": 15, "applied": true },
    { "min_nights": 90, "discount_percent": 20, "applied": false }
  ]
}
```

#### FR-4.5: Minimum Stay Validation (EXPERT)

**Challenge:** Enforce minimum stay requirements configured per room type

**Room Type Configuration:**
```json
{
  "pricing_config": {
    "minimum_stay_nights": 3
  }
}
```

**Requirements:**
1. Check room type's minimum_stay_nights before calculating price
2. Return validation error if booking duration < minimum
3. Provide clear error message with minimum requirement
4. Consider 0 as "no minimum" (e.g., hot desks, meeting rooms)

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MINIMUM_STAY_NOT_MET",
    "message": "This room type requires a minimum stay of 3 nights",
    "details": {
      "requested_nights": 1,
      "minimum_required": 3,
      "room_type": "Executive Office",
      "suggestion": "Please extend your booking to at least 2025-01-18"
    }
  }
}
```

#### FR-4.6: Weekend Pricing Premiums (EXPERT - OPTIONAL)

**Challenge:** Apply different pricing for weekend vs weekday bookings

**Room Type Configuration:**
```json
{
  "pricing_config": {
    "weekend_pricing": {
      "enabled": true,
      "premium_percent": 25,
      "weekend_days": ["saturday", "sunday"]
    }
  }
}
```

**Requirements:**
1. Split booking into weekday and weekend day counts
2. Apply premium to weekend days
3. Show separate line items for weekday vs weekend pricing
4. Handle bookings that span both weekdays and weekends

**Response Example:**
```json
{
  "total_price": 637.50,
  "breakdown": [
    {
      "type": "weekday",
      "days": 5,
      "rate_amount": 75.00,
      "subtotal": 375.00
    },
    {
      "type": "weekend",
      "days": 2,
      "rate_amount": 75.00,
      "premium_percent": 25,
      "premium_rate": 93.75,
      "subtotal": 187.50
    }
  ],
  "day_breakdown": [
    { "date": "2025-01-15", "day": "wednesday", "rate": 75.00 },
    { "date": "2025-01-18", "day": "saturday", "rate": 93.75 }
  ]
}
```

#### FR-4.7: Booking Creation with Price Calculation

**Endpoint:** `POST /api/bookings`

**Requirements:**
1. Reuse price calculation logic from `/calculate-price`
2. Validate unit availability (status must be "available")
3. Store calculated price with booking record
4. Optionally update unit status to "occupied" or "reserved"
5. Return created booking with all price details

**Error Handling:**
- Unit not found → 404
- Unit not available → 400 with current status
- Missing rates → 400 with missing periods
- Validation errors → 400 with field details
- Minimum stay not met → 400 with requirement details

## Non-Functional Requirements

### NFR-1: Performance
- API response time < 200ms for simple queries
- Support 100 concurrent users

### NFR-2: Data Integrity
- File-based database must handle concurrent reads/writes safely
- Atomic operations for critical updates

### NFR-3: Error Handling
- All API errors return structured JSON responses
- HTTP status codes follow REST conventions
- Validation errors include field-level details

### NFR-4: Developer Experience
- Clear API documentation
- Easy local setup (< 5 minutes)
- Comprehensive test data

## API Endpoints

### Rates
- `GET /api/rates` - List all rates (with filters)
- `GET /api/rates/:id` - Get rate by ID
- `POST /api/rates` - Create new rate
- `PUT /api/rates/:id` - Update rate
- `DELETE /api/rates/:id` - Delete rate
- `GET /api/rates/room-type/:roomTypeId` - Get rates for room type
- `POST /api/rates/sync` - Sync rates from external system

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Room Types
- `GET /api/room-types` - List all room types
- `GET /api/room-types/:id` - Get room type by ID
- `POST /api/room-types` - Create room type
- `PUT /api/room-types/:id` - Update room type
- `DELETE /api/room-types/:id` - Delete room type

### Units
- `GET /api/units` - List all units
- `GET /api/units/:id` - Get unit by ID
- `POST /api/units` - Create unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking (with price calculation)
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/calculate-price` - Calculate price without creating booking

## Known Issues & Limitations

### Data Quality Issues
- Some room types may have incomplete rate coverage (gaps in date ranges)
- Historical rates may be missing for certain properties
- Rate overlaps may exist in legacy data

### Technical Limitations
- File-based storage not suitable for high-concurrency production use
- No authentication/authorization implemented
- Limited audit trail for rate changes

## Success Metrics

- 100% rate coverage for active room types within next 90 days
- < 1% booking failures due to missing rates
- Sync process completes in < 10 seconds for 10,000 rates

## Future Enhancements

- Real-time rate availability search
- Dynamic pricing engine (ML-based)
- Multi-currency support with exchange rates
- Rate negotiation workflow for enterprise clients
- Integration with booking channels (APIs)
- Advanced reporting and analytics

---

**Document Version:** 1.0
**Last Updated:** 2025-01-17
**Owner:** Financials & Rates Team
