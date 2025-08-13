-- Script para criar usuário admin no Supabase

-- 1. Primeiro, criar o usuário na tabela auth.users do Supabase
-- Execute este comando no SQL Editor do Supabase:

-- Criar usuário admin usando a função RPC do Supabase
SELECT auth.signup(
  email := 'admin@hvacpro.com.br',
  password := 'admin#1234',
  email_confirmed := true
);

-- 2. Depois, inserir os dados na tabela users personalizada
INSERT INTO users (
  id,
  email, 
  name,
  role,
  created_at,
  updated_at
) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@hvacpro.com.br'),
  'admin@hvacpro.com.br',
  'Admin',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- 3. Verificar se o usuário foi criado corretamente
SELECT * FROM users WHERE email = 'admin@hvacpro.com.br';

-- 4. Verificar também na tabela auth.users
SELECT * FROM auth.users WHERE email = 'admin@hvacpro.com.br';