CREATE TABLE public.furniture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sprite_type TEXT NOT NULL, -- 'chair', 'table', 'plant', etc.
    price INTEGER NOT NULL CHECK (price >= 5 AND price <= 15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    furniture_id UUID NOT NULL REFERENCES public.furniture(id) ON DELETE CASCADE,
    placed_x INTEGER,
    placed_y INTEGER,
    room_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add coins to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_coin_reward TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Grants
GRANT SELECT ON public.furniture TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.furniture TO service_role;
GRANT ALL ON public.inventory TO service_role;

-- RLS
ALTER TABLE public.furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see furniture" ON public.furniture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own inventory" ON public.inventory FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- Initial catalog
INSERT INTO public.furniture (name, sprite_type, price) VALUES
('Cadeira Pixel', 'chair', 5),
('Mesa de Madeira', 'table', 10),
('Planta de Canto', 'plant', 8),
('Sofá Azul', 'sofa', 15),
('Tapete Vermelho', 'rug', 7);
