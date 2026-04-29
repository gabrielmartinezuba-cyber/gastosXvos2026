-- ==========================================
-- ESTRUCTURA COMPLETA: gastosXvos
-- ==========================================

-- 1. Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    match_id TEXT, -- Referencia al ID (código) del match
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Parejas / Matches (Usamos el código como ID para simplicidad de unión)
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY, -- El código de 6 caracteres (ej: 'AB12CD')
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending', -- 'pending' | 'active'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Gastos
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES profiles(id),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    is_settled BOOLEAN DEFAULT false, -- Nuevo: para el limpiador
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Liquidaciones
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Permitir todo por ahora para facilitar testeo, 
-- pero en producción deben restringirse al match_id)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Matches are viewable by participants." ON matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create matches." ON matches FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update matches to join." ON matches FOR UPDATE USING (true);
