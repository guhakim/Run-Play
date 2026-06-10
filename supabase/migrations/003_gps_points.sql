CREATE TABLE public.gps_points (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES public.run_sessions(id) ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  altitude FLOAT,
  speed_ms FLOAT,
  recorded_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.gps_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gps_points: read via session" ON public.gps_points
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.run_sessions rs WHERE rs.id = session_id AND rs.user_id = auth.uid())
  );

CREATE POLICY "gps_points: insert via session" ON public.gps_points
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.run_sessions rs WHERE rs.id = session_id AND rs.user_id = auth.uid())
  );

CREATE INDEX gps_points_session_time ON public.gps_points(session_id, recorded_at);
