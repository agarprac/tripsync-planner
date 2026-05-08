
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Traveler',
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_anonymous) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Traveler'),
    COALESCE((NEW.raw_user_meta_data->>'is_anonymous')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  vibe TEXT[] NOT NULL,
  budget_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'voting_open',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preferred_time_of_day TEXT,
  estimated_cost_min NUMERIC DEFAULT 0,
  estimated_cost_max NUMERIC DEFAULT 0,
  ai_insight TEXT,
  is_ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('must_do','interested','skip')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE UNIQUE NOT NULL,
  generated_plan JSONB NOT NULL,
  harmony_score INTEGER,
  harmony_breakdown JSONB,
  optimization_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.destination_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_city TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  suggestions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(destination_city, destination_country)
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_select" ON public.trips FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "trips_insert" ON public.trips FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "trips_update" ON public.trips FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "trips_delete" ON public.trips FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "members_select" ON public.members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "members_insert" ON public.members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete" ON public.members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "activities_select" ON public.activities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "activities_insert" ON public.activities FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  (SELECT status FROM public.trips WHERE id = trip_id) != 'finalized'
);
CREATE POLICY "activities_update" ON public.activities FOR UPDATE USING (auth.uid() = added_by);
CREATE POLICY "activities_delete" ON public.activities FOR DELETE USING (
  auth.uid() = added_by OR
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_id AND trips.created_by = auth.uid())
);

CREATE POLICY "votes_select" ON public.votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "votes_insert" ON public.votes FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.activities a JOIN public.trips t ON t.id = a.trip_id
    WHERE a.id = activity_id AND t.status != 'finalized')
);
CREATE POLICY "votes_update" ON public.votes FOR UPDATE USING (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.activities a JOIN public.trips t ON t.id = a.trip_id
    WHERE a.id = activity_id AND t.status != 'finalized')
);
CREATE POLICY "votes_delete" ON public.votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "itineraries_select" ON public.itineraries FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "suggestions_select" ON public.destination_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.itineraries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;

ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER TABLE public.votes REPLICA IDENTITY FULL;
ALTER TABLE public.trips REPLICA IDENTITY FULL;
ALTER TABLE public.itineraries REPLICA IDENTITY FULL;
ALTER TABLE public.members REPLICA IDENTITY FULL;

CREATE INDEX idx_activities_trip ON public.activities(trip_id);
CREATE INDEX idx_votes_activity ON public.votes(activity_id);
CREATE INDEX idx_members_trip ON public.members(trip_id);
