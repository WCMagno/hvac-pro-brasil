# Guia de Configuração do Supabase

## Visão Geral

Este projeto utiliza Supabase como backend, substituindo completamente o Prisma e SQLite. Siga este guia para configurar o sistema corretamente.

## Passo 1: Criar um Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações do projeto:
   - **Project Name**: `hvac-pro-brasil`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima de você (recomendado: South America)
5. Clique em "Create new project"
6. Aguarde a criação do projeto (pode levar alguns minutos)

## Passo 2: Obter as Credenciais

Após o projeto ser criado:

1. Clique em "Settings" → "API"
2. Copie as seguintes informações:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: Chave pública (começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key**: Chave de serviço (começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Passo 3: Configurar as Variáveis de Ambiente

Crie/edite o arquivo `.env.local` na raiz do projeto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration
NEXTAUTH_SECRET=VY9obmf3b+CglpNj7GXxlIhIBFI8U58r/RaCPsZ4ChA=
NEXTAUTH_URL=http://localhost:3000
```

**Importante**: Substitua os valores acima pelos seus dados reais.

## Passo 4: Executar o Schema SQL

1. No painel do Supabase, clique em "SQL Editor"
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run"

O schema criará as seguintes tabelas:
- `users` - Usuários do sistema
- `clients` - Perfil de clientes
- `technicians` - Perfil de técnicos
- `services` - Serviços de manutenção
- `financial` - Registros financeiros
- `receipts` - Recibos
- `pmoc_reports` - Relatórios PMOC
- `pmoc_images` - Imagens dos PMOCs

## Passo 5: Configurar Storage (Opcional)

Para upload de imagens:

1. No painel do Supabase, clique em "Storage"
2. Clique em "New bucket"
3. Configure:
   - **Name**: `pmoc-images`
   - **Public bucket**: Marque como público
   - **Allowed file types**: `image/*`
   - **Max file size**: `5242880` (5MB)

## Passo 6: Criar Usuário Administrador

Após configurar as variáveis de ambiente e executar o schema, execute:

```bash
# Certifique-se de que o servidor está rodando
npm run dev

# Em outro terminal, execute:
curl -X POST http://localhost:3000/api/create-admin -H "Content-Type: application/json"
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Usuário admin criado com sucesso",
  "data": {
    "id": "uuid-do-usuario",
    "email": "admin@hvacpro.com.br",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

## Passo 7: Testar o Sistema

1. Acesse `http://localhost:3000`
2. Clique em "Entrar"
3. Use as credenciais:
   - **Email**: `admin@hvacpro.com.br`
   - **Senha**: `admin#1234`

## Passo 8: Gerar Tipos TypeScript (Opcional)

Para ter autocompletar dos tipos do Supabase:

```bash
# Instale a CLI do Supabase
npm install -g supabase

# Faça login na CLI
supabase login

# Link seu projeto
supabase link --project-ref your-project-id

# Gere os tipos
npm run supabase:types
```

## Solução de Problemas

### Erro: "TypeError: fetch failed"
- Verifique se as variáveis de ambiente do Supabase estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique sua conexão com a internet
- Reinicie o servidor após alterar as variáveis de ambiente

### Erro: "next-auth warnings"
- Verifique se `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estão configurados
- Reinicie o servidor após alterar as variáveis de ambiente

### Erro: "Database connection failed"
- Verifique se o schema SQL foi executado corretamente
- Verifique se as tabelas foram criadas no Supabase
- Verifique as permissões do usuário no Supabase

### Erro: "Table users does not exist"
- Execute o schema SQL novamente
- Verifique se não houve erros durante a execução do SQL

### Erro: "Invalid API key"
- Verifique se as chaves do Supabase estão corretas
- Verifique se você está usando a chave correta (anon para client, service_role para server)

## Próximos Passos

Após a configuração inicial, você pode:

1. **Criar usuários técnicos e clientes**
   - Acesse a página de usuários como administrador
   - Clique em "Novo Usuário"
   - Preencha os dados e selecione o tipo de usuário

2. **Configurar serviços**
   - Acesse a página de serviços
   - Crie novos serviços de manutenção
   - Atribua técnicos aos serviços

3. **Criar PMOCs**
   - Acesse a página de PMOC
   - Crie novos relatórios de PMOC
   - Faça upload de fotos e documentos

4. **Configurar finanças**
   - Acesse a página financeira
   - Registre receitas e despesas
   - Gere recibos

## Backup e Migração

### Backup do Banco de Dados
1. No painel do Supabase, clique em "Settings"
2. Clique em "Database"
3. Em "Backups", você pode agendar backups automáticos

### Migração de Dados
Se você estava usando o Prisma anteriormente e precisa migrar dados:

1. Exporte seus dados do SQLite
2. Converta o formato para compatível com PostgreSQL
3. Importe usando o SQL Editor do Supabase

## Monitoramento e Logs

### Monitorar o Projeto
- Acesse o dashboard do Supabase
- Verifique métricas de uso
- Monitore erros e performance

### Logs do Projeto
- No painel do Supabase, clique em "Logs"
- Você pode ver logs de:
  - Autenticação
  - Banco de dados
  - Funções edge
  - Storage

## Segurança

### Boas Práticas
- Nunca exponha sua `service_role_key` no frontend
- Use Row Level Security (RLS) para proteger dados
- Mantenha suas variáveis de ambiente seguras
- Rode regularmente backups

### Configuração de RLS
O schema SQL já inclui políticas de RLS básicas, mas você pode ajustá-las conforme necessário nas configurações de "Authentication" → "Policies" no painel do Supabase.

---

Com estas configurações, seu sistema HVAC Pro Brasil estará totalmente funcional e pronto para uso em produção!