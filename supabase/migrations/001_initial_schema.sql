-- ============================================================
-- BizSwipe — Schema inicial
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- búsqueda full-text

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('buyer', 'seller');
CREATE TYPE business_status AS ENUM ('active', 'pending', 'sold', 'draft');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE notification_type AS ENUM ('match', 'message', 'view', 'save', 'inquiry');

-- ============================================================
-- PROFILES (extiende auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar TEXT,
  bio TEXT,
  location TEXT,
  country TEXT,
  phone TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,

  -- Buyer-specific
  investment_range_min NUMERIC,
  investment_range_max NUMERIC,
  interested_categories TEXT[],
  investment_experience TEXT,
  investment_type TEXT[], -- ['full_acquisition', 'minority_stake', 'majority_stake']

  -- Seller-specific
  business_count INTEGER DEFAULT 0,
  linkedin_url TEXT,
  website_url TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles: own write" ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger: crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  subcategory TEXT,
  location TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  status business_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  inquiries INTEGER NOT NULL DEFAULT 0,
  percentage_for_sale INTEGER NOT NULL DEFAULT 100 CHECK (percentage_for_sale BETWEEN 1 AND 100),

  -- Financials (desnormalizados para performance)
  annual_revenue NUMERIC NOT NULL DEFAULT 0,
  annual_profit NUMERIC NOT NULL DEFAULT 0,
  asking_price NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC NOT NULL DEFAULT 0,
  revenue_growth NUMERIC NOT NULL DEFAULT 0,
  employee_count INTEGER NOT NULL DEFAULT 0,
  year_established INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,

  -- Arrays
  highlights TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX businesses_seller_id_idx ON public.businesses(seller_id);
CREATE INDEX businesses_category_idx ON public.businesses(category);
CREATE INDEX businesses_status_idx ON public.businesses(status);
CREATE INDEX businesses_country_idx ON public.businesses(country);
CREATE INDEX businesses_asking_price_idx ON public.businesses(asking_price);
CREATE INDEX businesses_title_trgm_idx ON public.businesses USING GIN (title gin_trgm_ops);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "businesses: public read active" ON public.businesses FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "businesses: seller write" ON public.businesses FOR ALL USING (seller_id = auth.uid());

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BUSINESS IMAGES
-- ============================================================
CREATE TABLE public.business_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX business_images_business_id_idx ON public.business_images(business_id);

ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_images: public read" ON public.business_images FOR SELECT USING (true);
CREATE POLICY "business_images: seller write" ON public.business_images FOR ALL
  USING (business_id IN (SELECT id FROM public.businesses WHERE seller_id = auth.uid()));

-- ============================================================
-- SAVED BUSINESSES (favoritos)
-- ============================================================
CREATE TABLE public.saved_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

CREATE INDEX saved_businesses_user_id_idx ON public.saved_businesses(user_id);

ALTER TABLE public.saved_businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved: own access" ON public.saved_businesses FOR ALL USING (user_id = auth.uid());

-- Actualizar contador saves en business
CREATE OR REPLACE FUNCTION public.update_business_saves()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.businesses SET saves = saves + 1 WHERE id = NEW.business_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.businesses SET saves = GREATEST(saves - 1, 0) WHERE id = OLD.business_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_save_change
  AFTER INSERT OR DELETE ON public.saved_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_business_saves();

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status match_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, buyer_id)
);

CREATE INDEX matches_buyer_id_idx ON public.matches(buyer_id);
CREATE INDEX matches_seller_id_idx ON public.matches(seller_id);
CREATE INDEX matches_business_id_idx ON public.matches(business_id);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches: participants access" ON public.matches FOR ALL
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Actualizar contador inquiries en business al crear match
CREATE OR REPLACE FUNCTION public.update_business_inquiries()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.businesses SET inquiries = inquiries + 1 WHERE id = NEW.business_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_created
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_business_inquiries();

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, buyer_id, seller_id)
);

CREATE INDEX conversations_buyer_id_idx ON public.conversations(buyer_id);
CREATE INDEX conversations_seller_id_idx ON public.conversations(seller_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations: participants access" ON public.conversations FOR ALL
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages: conversation participants" ON public.messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX notifications_read_idx ON public.notifications(user_id, read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications: own access" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- STORAGE — imágenes de negocios
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "business-images: public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'business-images');

CREATE POLICY "business-images: auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

CREATE POLICY "business-images: own delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'business-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- VISTA: businesses con info del vendedor (para queries limpias)
-- ============================================================
CREATE VIEW public.businesses_with_seller AS
  SELECT
    b.*,
    p.name AS seller_name,
    p.avatar AS seller_avatar,
    p.verified AS seller_verified
  FROM public.businesses b
  JOIN public.profiles p ON b.seller_id = p.id;

-- ============================================================
-- FUNCIÓN: incrementar views de negocio
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_business_views(business_id UUID)
RETURNS void AS $$
  UPDATE public.businesses SET views = views + 1 WHERE id = business_id;
$$ LANGUAGE sql SECURITY DEFINER;
