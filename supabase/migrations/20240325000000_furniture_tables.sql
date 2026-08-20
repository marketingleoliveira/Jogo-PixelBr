-- Furniture Catalog
CREATE TABLE public.furniture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sprite_type TEXT NOT NULL, -- chair, table, plant, sofa, rug
    price INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User Inventory
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    furniture_id UUID REFERENCES public.furniture(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Furniture placed in rooms
CREATE TABLE public.room_furniture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL, -- Can be profile_id or public room name
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    furniture_id UUID REFERENCES public.furniture(id) ON DELETE CASCADE NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    direction INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add column for coins and last reward to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_coin_reward TIMESTAMPTZ DEFAULT now();

-- RLS & Grants
GRANT SELECT ON public.furniture TO authenticated;
GRANT ALL ON public.inventory TO authenticated;
GRANT ALL ON public.room_furniture TO authenticated;

ALTER TABLE public.furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_furniture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can see furniture" ON public.furniture FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their inventory" ON public.inventory FOR ALL TO authenticated USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their room furniture" ON public.room_furniture FOR ALL TO authenticated USING (auth.uid() = profile_id);
CREATE POLICY "Anyone can see furniture in a room" ON public.room_furniture FOR SELECT TO authenticated USING (true);

-- Initial Seed
INSERT INTO public.furniture (name, sprite_type, price) VALUES
('Cadeira de Madeira', 'chair', 5),
('Mesa de Jantar', 'table', 15),
('Cacto de Vaso', 'plant', 8),
('Sofá Confortável', 'sofa', 12),
('Tapete Vermelho', 'rug', 10);
