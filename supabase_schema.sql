-- ==========================================
-- ESTRUCTURA DE BASE DE DATOS: gastosXvos
-- ==========================================

-- 1. Tabla de Gastos (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL, -- Relación con la pareja (asumiendo tabla matches)
    payer_id UUID NOT NULL, -- Quién pagó (asumiendo tabla profiles)
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Liquidaciones (Settlements)
-- Para cuando deciden "limpiar" las deudas.
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Seguridad)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Nota: Recordá configurar las políticas de RLS para que solo los usuarios 
-- que pertenecen al 'match_id' puedan ver/editar estos registros.
