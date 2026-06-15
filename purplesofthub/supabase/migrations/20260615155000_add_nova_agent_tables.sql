-- Nova website agent persistence

CREATE TABLE IF NOT EXISTS public.chat_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  service_interest TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chat_leads'
      AND policyname = 'Admins can read chat leads'
  ) THEN
    CREATE POLICY "Admins can read chat leads"
      ON public.chat_leads FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS nova_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('public_sales', 'client_support', 'admin_ops')),
  page TEXT,
  service_interest TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'lead_captured', 'handoff_requested', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES nova_conversations(session_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES nova_conversations(session_id) ON DELETE SET NULL,
  lead_id INTEGER REFERENCES chat_leads(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'human' CHECK (channel IN ('human', 'whatsapp', 'telegram')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'notified', 'handled', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES nova_conversations(session_id) ON DELETE SET NULL,
  lead_id INTEGER REFERENCES chat_leads(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  summary TEXT NOT NULL,
  sent_to_softclaw BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nova_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read nova conversations"
  ON nova_conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Clients can read own nova conversations"
  ON nova_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read nova messages"
  ON nova_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read nova handoffs"
  ON nova_handoffs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can read nova alerts"
  ON nova_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_nova_conversations_session_id ON nova_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_nova_conversations_user_id ON nova_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_messages_session_id ON nova_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_created_at ON nova_alerts(created_at DESC);
