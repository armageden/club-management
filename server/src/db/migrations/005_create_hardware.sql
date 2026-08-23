-- Table 10: hardware_items
-- Stores hardware inventory

CREATE TABLE IF NOT EXISTS hardware_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  model VARCHAR(255),
  serial_number VARCHAR(255),
  quantity_available INTEGER NOT NULL DEFAULT 1 CHECK (quantity_available >= 0),
  condition VARCHAR(50) DEFAULT 'good',
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'damaged', 'lost', 'retired')),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hardware_items_event_id ON hardware_items(event_id);

-- Table 11: hardware_checkouts
-- Stores hardware checkout records

CREATE TABLE IF NOT EXISTS hardware_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  hardware_item_id UUID NOT NULL REFERENCES hardware_items(id) ON DELETE CASCADE,
  borrower_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_out_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checked_out_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overdue', 'returned', 'damaged')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_hardware_checkouts_event_id ON hardware_checkouts(event_id);
CREATE INDEX IF NOT EXISTS idx_hardware_checkouts_item_id ON hardware_checkouts(hardware_item_id);

-- Table 12: hardware_returns
-- Stores hardware return records

CREATE TABLE IF NOT EXISTS hardware_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES hardware_checkouts(id) ON DELETE CASCADE,
  returned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  condition VARCHAR(50),
  received_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT
);

-- Table 13: hardware_damage_reports
-- Stores damage reports for hardware

CREATE TABLE IF NOT EXISTS hardware_damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  hardware_item_id UUID NOT NULL REFERENCES hardware_items(id) ON DELETE CASCADE,
  checkout_id UUID REFERENCES hardware_checkouts(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_hardware_damage_reports_event_id ON hardware_damage_reports(event_id);
