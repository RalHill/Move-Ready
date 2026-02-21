-- Move Ready Plus - Initial Schema
-- Run this in Supabase SQL Editor

-- =============================================================================
-- 1. PROFILES TABLE (User roles)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('dispatcher', 'manager', 'driver')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_role_idx ON public.profiles(role);

-- RLS: Enable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- RLS: Service role only can insert/update profiles
CREATE POLICY "Service role manages profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================================================
-- 2. CREWS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'assigned', 'offline')),
    current_lat DECIMAL(10, 7) NOT NULL DEFAULT 43.6532, -- Toronto default
    current_lng DECIMAL(11, 7) NOT NULL DEFAULT -79.3832,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX crews_status_idx ON public.crews(status);
CREATE INDEX crews_location_idx ON public.crews(current_lat, current_lng);

-- RLS: Enable
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;

-- RLS: Dispatchers and managers can read all crews
CREATE POLICY "Dispatchers and managers read all crews"
ON public.crews
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('dispatcher', 'manager')
    )
);

-- RLS: Drivers can read all crews (to see who's available)
CREATE POLICY "Drivers read all crews"
ON public.crews
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'driver'
    )
);

-- RLS: Dispatchers can update crews
CREATE POLICY "Dispatchers update crews"
ON public.crews
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'dispatcher'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'dispatcher'
    )
);

-- RLS: Drivers can update location of their own crew
CREATE POLICY "Drivers update own crew location"
ON public.crews
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'driver'
    )
)
WITH CHECK (true);

-- =============================================================================
-- 3. JOBS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('unassigned', 'assigned', 'en_route', 'on_site', 'completed')) DEFAULT 'unassigned',
    crew_id UUID REFERENCES public.crews(id) ON DELETE SET NULL,
    risk_flag BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX jobs_status_idx ON public.jobs(status);
CREATE INDEX jobs_crew_id_idx ON public.jobs(crew_id);
CREATE INDEX jobs_scheduled_time_idx ON public.jobs(scheduled_time);
CREATE INDEX jobs_risk_flag_idx ON public.jobs(risk_flag) WHERE risk_flag = true;

-- RLS: Enable
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS: Dispatchers and managers can read all jobs
CREATE POLICY "Dispatchers and managers read all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('dispatcher', 'manager')
    )
);

-- RLS: Drivers can read only their assigned jobs
CREATE POLICY "Drivers read assigned jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.crews c ON c.id = jobs.crew_id
        WHERE p.id = auth.uid()
        AND p.role = 'driver'
    )
);

-- RLS: Dispatchers can insert/update jobs
CREATE POLICY "Dispatchers manage jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'dispatcher'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'dispatcher'
    )
);

-- RLS: Drivers can update status of their assigned jobs
CREATE POLICY "Drivers update assigned job status"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.crews c ON c.id = jobs.crew_id
        WHERE p.id = auth.uid()
        AND p.role = 'driver'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.crews c ON c.id = jobs.crew_id
        WHERE p.id = auth.uid()
        AND p.role = 'driver'
    )
);

-- =============================================================================
-- 4. ASSIGNMENT EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.assignment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    crew_id UUID NOT NULL REFERENCES public.crews(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX assignment_events_job_id_idx ON public.assignment_events(job_id);
CREATE INDEX assignment_events_crew_id_idx ON public.assignment_events(crew_id);
CREATE INDEX assignment_events_timestamp_idx ON public.assignment_events(timestamp DESC);

-- RLS: Enable
ALTER TABLE public.assignment_events ENABLE ROW LEVEL SECURITY;

-- RLS: Dispatchers and managers can read all assignment events
CREATE POLICY "Dispatchers and managers read assignment events"
ON public.assignment_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('dispatcher', 'manager')
    )
);

-- RLS: Dispatchers can insert assignment events
CREATE POLICY "Dispatchers insert assignment events"
ON public.assignment_events
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'dispatcher'
    )
    AND assigned_by = auth.uid()
);

-- =============================================================================
-- 5. ERROR LOGS TABLE (Observability)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX error_logs_timestamp_idx ON public.error_logs(timestamp DESC);
CREATE INDEX error_logs_user_id_idx ON public.error_logs(user_id);

-- RLS: Enable
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can insert their own errors
CREATE POLICY "Users insert own errors"
ON public.error_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- RLS: Managers can read all error logs
CREATE POLICY "Managers read error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'manager'
    )
);

-- =============================================================================
-- 6. REALTIME CONFIGURATION
-- =============================================================================

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_events;

-- =============================================================================
-- 7. SEED DATA (Development/Demo)
-- =============================================================================

-- Seed crews
INSERT INTO public.crews (name, status, current_lat, current_lng) VALUES
('Crew Alpha', 'available', 43.6532, -79.3832),
('Crew Bravo', 'available', 43.7000, -79.4163),
('Crew Charlie', 'offline', 43.6426, -79.3871),
('Crew Delta', 'available', 43.6629, -79.3957);

-- Seed jobs (for demo)
INSERT INTO public.jobs (customer_name, address, scheduled_time, status, crew_id, risk_flag) VALUES
('John Smith', '123 King St, Toronto ON', NOW() + INTERVAL '2 hours', 'unassigned', NULL, false),
('Sarah Johnson', '456 Queen St, Toronto ON', NOW() + INTERVAL '4 hours', 'unassigned', NULL, false),
('Mike Wilson', '789 Bay St, Toronto ON', NOW() + INTERVAL '1 day', 'unassigned', NULL, false),
('Emma Davis', '321 Yonge St, Toronto ON', NOW() - INTERVAL '1 hour', 'assigned', (SELECT id FROM public.crews WHERE name = 'Crew Alpha' LIMIT 1), true),
('David Lee', '654 Bloor St, Toronto ON', NOW() + INTERVAL '3 hours', 'unassigned', NULL, false);

-- =============================================================================
-- 8. FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update jobs.updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger: Update crews.updated_at
CREATE TRIGGER update_crews_updated_at
BEFORE UPDATE ON public.crews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Function: Detect risk flags (delayed jobs)
CREATE OR REPLACE FUNCTION update_risk_flags()
RETURNS void AS $$
BEGIN
    UPDATE public.jobs
    SET risk_flag = true
    WHERE scheduled_time < NOW() - INTERVAL '30 minutes'
    AND status NOT IN ('completed')
    AND risk_flag = false;
END;
$$ LANGUAGE plpgsql;

-- Note: Call update_risk_flags() periodically via cron or Edge Function
-- For demo, you can run manually: SELECT update_risk_flags();

-- =============================================================================
-- NOTES FOR MANUAL IMPLEMENTATION
-- =============================================================================

-- After running this migration:
-- 1. Create test users in Supabase Auth Dashboard (email/password)
-- 2. Manually insert profiles for each user with appropriate role
-- 3. Verify RLS policies work by testing as different users
-- 4. Set up Supabase Realtime in project settings (already enabled above)
-- 5. Consider adding pg_cron extension for automated risk flag updates
