-- Database Migration: Forest Department Dashboard & Wildlife Intelligence System
-- Execute this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Rename existing tables to secure tables if they haven't been renamed already
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tigers') AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tigers_secure') THEN
    ALTER TABLE public.tigers RENAME TO tigers_secure;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sightings') AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sightings_secure') THEN
    ALTER TABLE public.sightings RENAME TO sightings_secure;
  END IF;
END $$;

-- 2. Create User Roles Table for RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('forest_official', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create Helper Functions for Role Authorization (SECURITY DEFINER to run with bypass rights)
CREATE OR REPLACE FUNCTION public.is_official()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND (role = 'forest_official' OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Public/Filtered Views representing the old table names
-- These views dynamically mask/anonymize coordinates for public users and return full precision for authorized officials.
CREATE OR REPLACE VIEW public.tigers AS
SELECT 
  id,
  name,
  species,
  emoji,
  CASE 
    WHEN public.is_official() THEN lat
    ELSE ROUND(lat::numeric, 2)::double precision -- Anonymize location to ~1.1km
  END AS lat,
  CASE 
    WHEN public.is_official() THEN lng
    ELSE ROUND(lng::numeric, 2)::double precision -- Anonymize location to ~1.1km
  END AS lng,
  current_zone,
  previous_zone,
  speed,
  max_speed,
  color,
  CASE 
    WHEN public.is_official() THEN path_history
    ELSE '[]'::jsonb -- Hide exact track details for public
  END AS path_history,
  created_at
FROM public.tigers_secure;

CREATE OR REPLACE VIEW public.sightings AS
SELECT 
  id,
  tiger_id,
  camera_id,
  timestamp,
  zone,
  confidence,
  detection_type,
  status,
  CASE 
    WHEN public.is_official() THEN lat
    ELSE ROUND(lat::numeric, 2)::double precision
  END AS lat,
  CASE 
    WHEN public.is_official() THEN lng
    ELSE ROUND(lng::numeric, 2)::double precision
  END AS lng,
  image_url,
  created_at
FROM public.sightings_secure;

-- Grant permissions to read views
GRANT SELECT ON public.tigers TO anon, authenticated;
GRANT SELECT ON public.sightings TO anon, authenticated;

-- 5. Create Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'NEW',
  tiger_id TEXT REFERENCES public.tigers_secure(id) ON DELETE SET NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  zone TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_image_url TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Alert Audit Log (activity log)
CREATE TABLE IF NOT EXISTS public.alert_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Enable RLS on Secure Tables
ALTER TABLE public.tigers_secure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sightings_secure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_activity ENABLE ROW LEVEL SECURITY;

-- 8. Define RLS Policies

-- User Roles: Read by authenticated, manage by admin
CREATE POLICY "Allow users to view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow admins to manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Tigers Secure: Read/Manage only by officials/admins
CREATE POLICY "Allow officials to manage secure tigers" ON public.tigers_secure
  FOR ALL TO authenticated USING (public.is_official()) WITH CHECK (public.is_official());

-- Sightings Secure: Read/Manage only by officials/admins
CREATE POLICY "Allow officials to manage secure sightings" ON public.sightings_secure
  FOR ALL TO authenticated USING (public.is_official()) WITH CHECK (public.is_official());

-- Alerts: Read/Manage only by officials/admins
CREATE POLICY "Allow officials to manage alerts" ON public.alerts
  FOR ALL TO authenticated USING (public.is_official()) WITH CHECK (public.is_official());

-- Alert Activity: Read/Manage only by officials/admins
CREATE POLICY "Allow officials to manage alert activities" ON public.alert_activity
  FOR ALL TO authenticated USING (public.is_official()) WITH CHECK (public.is_official());

-- 9. Setup Supabase Realtime for Alerts
-- Remove from publication if exists to avoid conflicts, then add
DO $$
BEGIN
  -- Check if publication exists
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- If alerts is not in publication, add it
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'alerts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
    END IF;
  END IF;
END $$;
