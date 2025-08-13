# Guia para Criar Usuário Admin no Supabase

## Problema
O usuário admin não foi criado automaticamente no Supabase quando você executou o schema SQL. Isso impede o login no sistema.

## Soluções Disponíveis

### Opção 1: Via API Route (Recomendado)

1. **Execute a API para criar o usuário admin:**
   ```bash
   curl -X POST http://localhost:3000/api/create-admin
   ```

   Ou se você preferir usar o navegador:
   - Acesse: `http://localhost:3000/api/create-admin`
   - A API irá criar o usuário admin automaticamente

2. **Teste o login:**
   - Email: `admin@hvacpro.com.br`
   - Senha: `admin#1234`

### Opção 2: Via SQL Editor do Supabase

1. **Acesse o painel do Supabase**
2. **Vá para SQL Editor**
3. **Execute o seguinte script:**

```sql
-- Criar usuário admin com senha hash
INSERT INTO users (
  id,
  email, 
  name,
  role,
  password_hash,
  created_at,
  updated_at
) 
VALUES (
  gen_random_uuid(),
  'admin@hvacpro.com.br',
  'Admin',
  'ADMIN',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  updated_at = EXCLUDED.updated_at;

-- Verificar se o usuário foi criado
SELECT * FROM users WHERE email = 'admin@hvacpro.com.br';
```

### Opção 3: Via Interface do Supabase Auth

1. **Acesse Authentication > Users** no painel do Supabase
2. **Clique em "Add user"**
3. **Preencha os dados:**
   - Email: `admin@hvacpro.com.br`
   - Senha: `admin#1234`
   - Marque "Auto-confirm user"
4. **Depois, execute este SQL para adicionar à tabela users:**

```sql
INSERT INTO users (
  id,
  email, 
  name,
  role,
  password_hash,
  created_at,
  updated_at
) 
VALUES (
  'ID_DO_USUARIO_CRIADO', -- Substitua pelo ID real
  'admin@hvacpro.com.br',
  'Admin',
  'ADMIN',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZeUfkZMBs9kYZP6',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  updated_at = EXCLUDED.updated_at;
```

## O que foi modificado no sistema?

### 1. Sistema de Autenticação Atualizado
- **Arquivo:** `src/lib/auth/config.ts`
- **Mudança:** Agora usa Supabase em vez de Prisma para buscar usuários
- **Benefício:** Mantém a estrutura do NextAuth mas com dados do Supabase

### 2. Hook de Autenticação Atualizado
- **Arquivo:** `src/hooks/use-auth.ts`
- **Mudança:** Removeu dependência do Prisma types
- **Benefício:** Mais flexível e compatível com Supabase

### 3. API para Criar Admin
- **Arquivo:** `src/app/api/create-admin/route.ts`
- **Funcionalidade:** Cria usuário admin automaticamente
- **Benefício:** Fácil de usar e testar

## Passos para Testar

1. **Execute uma das opções acima** para criar o usuário admin
2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
3. **Acesse a página de login:** `http://localhost:3000/auth/signin`
4. **Faça login com:**
   - Email: `admin@hvacpro.com.br`
   - Senha: `admin#1234`

## Verificação

Se o login funcionar, você será redirecionado para o dashboard principal. Se não funcionar, verifique:

1. **Se o usuário foi criado no Supabase:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@hvacpro.com.br';
   ```

2. **Se as variáveis de ambiente estão corretas:**
   ```bash
   cat .env.local
   ```

3. **Se o servidor está rodando:**
   ```bash
   npm run dev
   ```

## Problemas Comuns

### 1. "Usuário não encontrado"
- **Causa:** Usuário não existe na tabela users
- **Solução:** Execute uma das opções acima para criar o usuário

### 2. "Senha inválida"
- **Causa:** Hash da senha incorreto
- **Solução:** Use o hash fornecido ou crie um novo hash

### 3. "Erro de conexão com Supabase"
- **Causa:** Variáveis de ambiente incorretas
- **Solução:** Verifique as credenciais no `.env.local`

## Suporte

Se continuar com problemas, verifique o console do navegador e do servidor para mensagens de erro específicas.