CREATE TABLE public.coaching_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES public.run_sessions(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL,
  message TEXT NOT NULL,
  fired_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coaching_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaching_logs: read via session" ON public.coaching_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.run_sessions rs WHERE rs.id = session_id AND rs.user_id = auth.uid())
  );

CREATE POLICY "coaching_logs: insert via session" ON public.coaching_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.run_sessions rs WHERE rs.id = session_id AND rs.user_id = auth.uid())
  );
