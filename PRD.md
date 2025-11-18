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

**FR-4.1:** System shall calculate booking prices
- Given unit_id, start_date, end_date, calculate total price
- Use room type rates for calculation
- Handle multi-rate period bookings

**FR-4.2:** System shall validate booking requests
- Unit must exist and be available
- Dates must be valid (start before end)
- Rates must exist for entire booking period

**FR-4.3:** System shall create bookings
- Store calculated price with booking
- Update unit status
- Return booking confirmation

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
