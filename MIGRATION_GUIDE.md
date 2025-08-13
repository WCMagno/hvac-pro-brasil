# Guia de Migração: Prisma → Supabase

## Visão Geral

Este guia descreve como migrar o projeto HVAC Pro Brasil do Prisma + SQLite para Supabase + PostgreSQL. Esta migração oferece benefícios significativos em termos de escalabilidade, performance e recursos.

## 🎯 Benefícios da Migração

### ✅ Vantagens do Supabase
- **Escalabilidade Infinita**: PostgreSQL com capacidade de crescimento ilimitada
- **Backup Automático**: Backups diários automáticos incluídos
- **Real-time**: Suporte nativo a WebSocket para atualizações em tempo real
- **Storage Integrado**: Sistema de arquivos na nuvem com CDN
- **Autenticação Pronta**: Sistema de autenticação completo com JWT
- **API REST Automática**: Geração automática de APIs REST
- **Row Level Security**: Segurança em nível de linha de dados
- **Edge Functions**: Funções serverless na edge

### ❌ Limitações do Prisma + SQLite
- **Escalabilidade Limitada**: SQLite não é ideal para aplicações com muitos usuários
- **Backup Manual**: Necessidade de backup manual do arquivo de banco
- **Sem Real-time**: Necessidade de implementar WebSocket separadamente
- **Storage Local**: Limitado ao sistema de arquivos do servidor
- **Single File**: Todo o banco em um único arquivo (pode corromper)

## 📋 Checklist de Migração

- [ ] Remover dependências do Prisma
- [ ] Configurar projeto Supabase
- [ ] Atualizar variáveis de ambiente
- [ ] Executar schema SQL
- [ ] Atualizar código para usar Supabase
- [ ] Testar todas as funcionalidades
- [ ] Fazer deploy

## 🔧 Passos Técnicos

### 1. Remover Dependências do Prisma

```bash
# Remover pacotes do Prisma
npm uninstall @prisma/client prisma

# Remover arquivos do Prisma
rm -rf prisma/
rm -f .env
rm -rf db/
```

### 2. Atualizar package.json

As seguintes mudanças foram feitas no package.json:

**Scripts Removidos:**
- `db:push`
- `db:generate`
- `db:migrate`
- `db:reset`
- `db:seed`

**Scripts Adicionados:**
- `db:setup` - Instruções para configurar Supabase
- `db:seed` - Instruções para criar admin via API
- `supabase:types` - Gerar tipos do Supabase

### 3. Configurar Supabase

1. **Criar Projeto:**
   - Acesse [Supabase Dashboard](https://supabase.com/dashboard)
   - Clique em "New Project"
   - Preencha os dados do projeto

2. **Obter Credenciais:**
   - Vá para Settings → API
   - Copie URL, anon key e service_role key

3. **Configurar Variáveis de Ambiente:**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

### 4. Migrar Schema

O schema do Prisma foi convertido para SQL PostgreSQL:

**Arquivo Antigo (Prisma):**
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole
  password  String
  // ... outros campos
}
```

**Arquivo Novo (Supabase SQL):**
```sql
-- supabase-schema.sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TECHNICIAN', 'CLIENT')),
  password_hash TEXT NOT NULL,
  -- ... outros campos
);
```

### 5. Migrar Código

#### Client Database

**Antigo (Prisma):**
```typescript
import { db } from '@/lib/db'

const users = await db.user.findMany()
```

**Novo (Supabase):**
```typescript
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const { data: users, error } = await supabase.from('users').select('*')
```

#### Autenticação

**Antigo (Prisma + NextAuth):**
```typescript
// Buscar usuário no Prisma
const user = await db.user.findUnique({
  where: { email: credentials.email }
})
```

**Novo (Supabase + NextAuth):**
```typescript
// Buscar usuário no Supabase
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', credentials.email)
  .single()
```

#### Tipos

**Antigo (Prisma Enums):**
```typescript
import { UserRole } from '@prisma/client'
```

**Novo (Tipos Locais):**
```typescript
import { UserRole } from '@/types'
```

### 6. Migrar Dados (Opcional)

Se você tem dados existentes no SQLite:

```bash
# Exportar dados do SQLite
sqlite3 db/custom.db ".dump" > backup.sql

# Converter para PostgreSQL (pode requerer ajustes manuais)
# Importar para o Supabase via SQL Editor
```

## 🧪 Testes de Migração

### 1. Testar Conexão
```bash
# Testar API de health
curl http://localhost:3000/api/health
```

### 2. Testar Autenticação
```bash
# Criar usuário admin
curl -X POST http://localhost:3000/api/create-admin \
  -H "Content-Type: application/json"
```

### 3. Testar CRUD
- [ ] Criar usuário
- [ ] Listar usuários
- [ ] Atualizar usuário
- [ ] Deletar usuário
- [ ] Criar serviço
- [ ] Listar serviços
- [ ] Criar PMOC
- [ ] Upload de imagem

## 🚀 Deploy

### Vercel (Recomendado)

1. **Configurar Variáveis de Ambiente no Vercel:**
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel

   # Fazer login
   vercel login

   # Configurar environment variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

2. **Fazer Deploy:**
   ```bash
   vercel --prod
   ```

### Outras Plataformas

- **Railway:** Conecte repositório e configure variáveis de ambiente
- **Netlify:** Configure build command e variáveis de ambiente
- **Digital Ocean:** Use App Platform com variáveis de ambiente

## 📊 Comparação de Performance

| Métrica | Prisma + SQLite | Supabase + PostgreSQL |
|---------|-----------------|----------------------|
| **Leituras/s** | ~1,000 | ~10,000+ |
| **Escritas/s** | ~100 | ~1,000+ |
| **Conexões** | 1 (single file) | Ilimitadas |
| **Backup** | Manual | Automático |
| **Real-time** | Não | Sim |
| **Storage** | Local | Cloud + CDN |
| **Escalabilidade** | Limitada | Ilimitada |

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão
```
TypeError: fetch failed
```
**Solução:**
- Verifique variáveis de ambiente
- Verifique se projeto Supabase está ativo
- Reinicie o servidor

#### 2. Tipos Não Encontrados
```
Cannot find module '@/types' or its corresponding type declarations.
```
**Solução:**
- Verifique se arquivo `src/types/index.ts` existe
- Reinicie o TypeScript server

#### 3. Tabelas Não Encontradas
```
relation "users" does not exist
```
**Solução:**
- Execute o schema SQL no Supabase
- Verifique se não houve erros na execução

#### 4. Permissões Negadas
```
permission denied for table users
```
**Solução:**
- Verifique políticas RLS no Supabase
- Use service_role_key para operações admin

### Rollback

Se precisar voltar para o Prisma:

```bash
# Reinstalar Prisma
npm install @prisma/client prisma

# Restaurar arquivos
git checkout prisma/
git checkout .env

# Recriar database
npm run db:push
```

## 📈 Melhorias Futuras

### Planejado
- [ ] Implementar Row Level Security avançado
- [ ] Adicionar Edge Functions para processamento de imagens
- [ ] Implementar webhooks para notificações
- [ ] Adicionar analytics integrado
- [ ] Implementar cache com Redis

### Opcional
- [ ] Migrar para Supabase Auth nativo
- [ ] Implementar storage avançado com versionamento
- [ ] Adicionar auditoria de logs
- [ ] Implementar replicação multi-região

## 📞 Suporte

Se encontrar problemas durante a migração:

1. **Verifique os logs:** `tail -f dev.log`
2. **Consulte o guia de solução de problemas:** `SUPABASE_SETUP_GUIDE.md`
3. **Verifique o status do Supabase:** [Supabase Status](https://status.supabase.com/)
4. **Comunidade Supabase:** [Discord](https://discord.supabase.com/)

---

Com esta migração, seu sistema HVAC Pro Brasil estará preparado para escalar e oferecer uma experiência muito melhor para seus usuários! 🚀