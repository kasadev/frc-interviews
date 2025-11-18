// Seed data for development and testing

const properties = [
  {
    property_id: 'prop_downtown_hub',
    name: 'Downtown Hub',
    address: '123 Main Street, San Francisco, CA 94105',
    timezone: 'America/Los_Angeles',
    status: 'active'
  },
  {
    property_id: 'prop_tech_campus',
    name: 'Tech Campus North',
    address: '456 Innovation Drive, San Jose, CA 95110',
    timezone: 'America/Los_Angeles',
    status: 'active'
  }
];

const room_types = [
  {
    room_type_id: 'rt_exec_office_dt',
    property_id: 'prop_downtown_hub',
    name: 'Executive Office',
    description: 'Private office with premium amenities, ideal for executives and senior management',
    capacity: 2,
    amenities: ['Standing Desk', 'Herman Miller Chair', 'Whiteboard', 'External Monitor', 'High-Speed Internet']
  },
  {
    room_type_id: 'rt_hot_desk_dt',
    property_id: 'prop_downtown_hub',
    name: 'Hot Desk',
    description: 'Flexible workspace in open area, first-come first-served',
    capacity: 1,
    amenities: ['Desk', 'Chair', 'Power Outlet', 'WiFi']
  },
  {
    room_type_id: 'rt_meeting_large_dt',
    property_id: 'prop_downtown_hub',
    name: 'Meeting Room Large',
    description: 'Large conference room with AV equipment',
    capacity: 12,
    amenities: ['Conference Table', '65-inch Display', 'Video Conferencing', 'Whiteboard', 'Catering Setup']
  },
  {
    room_type_id: 'rt_private_office_tc',
    property_id: 'prop_tech_campus',
    name: 'Private Office',
    description: 'Standard private office with essential amenities',
    capacity: 1,
    amenities: ['Desk', 'Ergonomic Chair', 'Storage Cabinet', 'Window View']
  },
  {
    room_type_id: 'rt_collab_space_tc',
    property_id: 'prop_tech_campus',
    name: 'Collaboration Space',
    description: 'Open collaboration area with flexible seating',
    capacity: 6,
    amenities: ['Modular Furniture', 'Whiteboard Walls', 'Standing Tables', 'Lounge Seating']
  }
];

const units = [
  // Executive Offices - Downtown Hub
  { unit_id: 'unit_dt_exec_001', room_type_id: 'rt_exec_office_dt', unit_number: 'EO-101', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_exec_002', room_type_id: 'rt_exec_office_dt', unit_number: 'EO-102', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_exec_003', room_type_id: 'rt_exec_office_dt', unit_number: 'EO-201', floor: 2, status: 'occupied' },

  // Hot Desks - Downtown Hub
  { unit_id: 'unit_dt_desk_001', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-A01', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_desk_002', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-A02', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_desk_003', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-A03', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_desk_004', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-A04', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_desk_005', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-A05', floor: 1, status: 'available' },
  { unit_id: 'unit_dt_desk_006', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-B01', floor: 2, status: 'available' },
  { unit_id: 'unit_dt_desk_007', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-B02', floor: 2, status: 'available' },
  { unit_id: 'unit_dt_desk_008', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-B03', floor: 2, status: 'available' },
  { unit_id: 'unit_dt_desk_009', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-B04', floor: 2, status: 'available' },
  { unit_id: 'unit_dt_desk_010', room_type_id: 'rt_hot_desk_dt', unit_number: 'HD-B05', floor: 2, status: 'maintenance' },

  // Meeting Rooms - Downtown Hub
  { unit_id: 'unit_dt_meet_001', room_type_id: 'rt_meeting_large_dt', unit_number: 'MR-301', floor: 3, status: 'available' },
  { unit_id: 'unit_dt_meet_002', room_type_id: 'rt_meeting_large_dt', unit_number: 'MR-302', floor: 3, status: 'available' },

  // Private Offices - Tech Campus
  { unit_id: 'unit_tc_office_001', room_type_id: 'rt_private_office_tc', unit_number: 'PO-101', floor: 1, status: 'available' },
  { unit_id: 'unit_tc_office_002', room_type_id: 'rt_private_office_tc', unit_number: 'PO-102', floor: 1, status: 'available' },
  { unit_id: 'unit_tc_office_003', room_type_id: 'rt_private_office_tc', unit_number: 'PO-103', floor: 1, status: 'occupied' },
  { unit_id: 'unit_tc_office_004', room_type_id: 'rt_private_office_tc', unit_number: 'PO-104', floor: 1, status: 'available' },
  { unit_id: 'unit_tc_office_005', room_type_id: 'rt_private_office_tc', unit_number: 'PO-201', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_office_006', room_type_id: 'rt_private_office_tc', unit_number: 'PO-202', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_office_007', room_type_id: 'rt_private_office_tc', unit_number: 'PO-203', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_office_008', room_type_id: 'rt_private_office_tc', unit_number: 'PO-204', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_office_009', room_type_id: 'rt_private_office_tc', unit_number: 'PO-301', floor: 3, status: 'available' },
  { unit_id: 'unit_tc_office_010', room_type_id: 'rt_private_office_tc', unit_number: 'PO-302', floor: 3, status: 'available' },

  // Collaboration Spaces - Tech Campus
  { unit_id: 'unit_tc_collab_001', room_type_id: 'rt_collab_space_tc', unit_number: 'CS-A', floor: 1, status: 'available' },
  { unit_id: 'unit_tc_collab_002', room_type_id: 'rt_collab_space_tc', unit_number: 'CS-B', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_collab_003', room_type_id: 'rt_collab_space_tc', unit_number: 'CS-C', floor: 2, status: 'available' },
  { unit_id: 'unit_tc_collab_004', room_type_id: 'rt_collab_space_tc', unit_number: 'CS-D', floor: 3, status: 'available' },
  { unit_id: 'unit_tc_collab_005', room_type_id: 'rt_collab_space_tc', unit_number: 'CS-E', floor: 3, status: 'available' }
];

const rates = [
  // Executive Office - Downtown Hub
  // BUG: Missing rates for April-June (Q2)
  {
    rate_id: 'rate_exec_dt_daily_q1',
    room_type_id: 'rt_exec_office_dt',
    rate_type: 'daily',
    amount: 150.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-03-31'
  },
  {
    rate_id: 'rate_exec_dt_daily_h2',
    room_type_id: 'rt_exec_office_dt',
    rate_type: 'daily',
    amount: 175.00,
    currency: 'USD',
    effective_date: '2025-07-01',
    end_date: '2025-12-31'
  },
  {
    rate_id: 'rate_exec_dt_monthly_q1',
    room_type_id: 'rt_exec_office_dt',
    rate_type: 'monthly',
    amount: 3500.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-03-31'
  },

  // Hot Desk - Downtown Hub (Complete coverage)
  {
    rate_id: 'rate_desk_dt_hourly_2025',
    room_type_id: 'rt_hot_desk_dt',
    rate_type: 'hourly',
    amount: 15.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-12-31'
  },
  {
    rate_id: 'rate_desk_dt_daily_2025',
    room_type_id: 'rt_hot_desk_dt',
    rate_type: 'daily',
    amount: 50.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-12-31'
  },
  {
    rate_id: 'rate_desk_dt_monthly_2025',
    room_type_id: 'rt_hot_desk_dt',
    rate_type: 'monthly',
    amount: 800.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-12-31'
  },

  // Meeting Room Large - Downtown Hub
  // BUG: COMPLETELY MISSING RATES (candidates should discover this)

  // Private Office - Tech Campus
  // BUG: Overlapping date ranges (intentional data quality issue)
  {
    rate_id: 'rate_office_tc_daily_h1',
    room_type_id: 'rt_private_office_tc',
    rate_type: 'daily',
    amount: 120.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-06-30'
  },
  {
    rate_id: 'rate_office_tc_daily_overlap',
    room_type_id: 'rt_private_office_tc',
    rate_type: 'daily',
    amount: 125.00,
    currency: 'USD',
    effective_date: '2025-06-15',  // Overlaps with previous rate!
    end_date: '2025-09-30'
  },
  {
    rate_id: 'rate_office_tc_daily_q4',
    room_type_id: 'rt_private_office_tc',
    rate_type: 'daily',
    amount: 130.00,
    currency: 'USD',
    effective_date: '2025-10-01',
    end_date: '2025-12-31'
  },
  {
    rate_id: 'rate_office_tc_monthly_2025',
    room_type_id: 'rt_private_office_tc',
    rate_type: 'monthly',
    amount: 2800.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-12-31'
  },

  // Collaboration Space - Tech Campus
  // BUG: Missing H2 rates (July-December)
  {
    rate_id: 'rate_collab_tc_hourly_h1',
    room_type_id: 'rt_collab_space_tc',
    rate_type: 'hourly',
    amount: 35.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-06-30'
  },
  {
    rate_id: 'rate_collab_tc_daily_h1',
    room_type_id: 'rt_collab_space_tc',
    rate_type: 'daily',
    amount: 200.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-06-30'
  }
];

const bookings = [
  {
    booking_id: 'book_001',
    unit_id: 'unit_dt_exec_003',
    customer_name: 'Acme Corporation',
    customer_email: 'booking@acme.com',
    start_date: '2025-01-15',
    end_date: '2025-02-14',
    calculated_price: 3500.00,
    currency: 'USD',
    status: 'confirmed'
  },
  {
    booking_id: 'book_002',
    unit_id: 'unit_tc_office_003',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    start_date: '2025-02-01',
    end_date: '2025-02-28',
    calculated_price: 2800.00,
    currency: 'USD',
    status: 'confirmed'
  }
];

// Mock external rate feed (for sync endpoint)
const external_rates = [
  {
    room_type_id: 'rt_exec_office_dt',
    rate_type: 'daily',
    amount: 160.00,
    currency: 'USD',
    effective_date: '2025-04-01',
    end_date: '2025-06-30'
  },
  {
    room_type_id: 'rt_meeting_large_dt',
    rate_type: 'hourly',
    amount: 75.00,
    currency: 'USD',
    effective_date: '2025-01-01',
    end_date: '2025-12-31'
  },
  {
    room_type_id: 'rt_collab_space_tc',
    rate_type: 'hourly',
    amount: 40.00,
    currency: 'USD',
    effective_date: '2025-07-01',
    end_date: '2025-12-31'
  }
];

module.exports = {
  properties,
  room_types,
  units,
  rates,
  bookings,
  external_rates
};
