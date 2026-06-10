CREATE TABLE public.run_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  target_distance_km FLOAT NOT NULL,
  target_pace_sec_per_km INT NOT NULL,
  actual_distance_km FLOAT DEFAULT 0,
  actual_duration_seconds INT DEFAULT 0,
  avg_pace_sec_per_km INT DEFAULT 0,
  max_heart_rate INT DEFAULT 0,
  avg_heart_rate INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.run_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "run_sessions: read own" ON public.run_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "run_sessions: insert own" ON public.run_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "run_sessions: update own" ON public.run_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX run_sessions_user_started ON public.run_sessions(user_id, started_at DESC);
