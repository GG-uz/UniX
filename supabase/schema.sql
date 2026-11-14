-- UniSport League Database Schema
-- Supabase / PostgreSQL DDL with RLS and Constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumerations
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT_CAPTAIN', 'VENUE_MANAGER', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sport_type AS ENUM ('FOOTBALL', 'BASKETBALL', 'VOLLEYBALL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM ('OPEN', 'BOOKED', 'COMPLETED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID_FULL', 'PAID_SPLIT', 'REFUNDED', 'FORFEITED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'STUDENT_CAPTAIN',
    university_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sport_type sport_type NOT NULL,
    captain_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    university_name TEXT NOT NULL,
    logo_url TEXT,
    matches_won INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    matches_drawn INT DEFAULT 0,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Venues
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    manager_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Moscow',
    hourly_rate NUMERIC(10, 2) NOT NULL,
    sport_types sport_type[] NOT NULL,
    surface_type TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.80,
    cancellation_hours INT DEFAULT 48,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Slots
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    price NUMERIC(10, 2) NOT NULL
);

-- 5. Matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_type sport_type NOT NULL,
    challenger_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    opponent_team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
    venue_id UUID REFERENCES venues(id) ON DELETE RESTRICT,
    slot_id UUID REFERENCES slots(id) ON DELETE RESTRICT,
    status match_status DEFAULT 'OPEN',
    score_team_1 INT,
    score_team_2 INT,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'PENDING',
    cancellation_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_split_payment BOOLEAN DEFAULT FALSE,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger / Rule for 48h cancellation computation
CREATE OR REPLACE FUNCTION set_booking_cancellation_deadline()
RETURNS TRIGGER AS $$
BEGIN
  SELECT (s.start_time - INTERVAL '48 hours')
  INTO NEW.cancellation_deadline
  FROM matches m
  JOIN slots s ON s.id = m.slot_id
  WHERE m.id = NEW.match_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_deadline ON bookings;
CREATE TRIGGER trg_booking_deadline
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_cancellation_deadline();
