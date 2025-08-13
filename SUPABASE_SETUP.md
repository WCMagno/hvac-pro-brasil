# Configuração do Supabase para HVAC Pro Brasil

## Passos para configurar o Supabase:

### 1. Criar projeto Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações:
   - **Organization:** Seu nome ou empresa
   - **Project Name:** `hvac-pro-brasil`
   - **Database Password:** Crie uma senha forte
   - **Region:** Escolha a região mais próxima (recomendo `South America (São Paulo)`)
5. Clique em "Create new project"

### 2. Obter credenciais
Após o projeto ser criado:
1. Vá para **Project Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Executar o schema SQL
1. Vá para **SQL Editor** no painel do Supabase
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run"

### 5. Configurar Storage para imagens
1. Vá para **Storage** no painel do Supabase
2. Clique em "New bucket"
3. Configure:
   - **Name:** `hvac-images`
   - **Public bucket:** Marque esta opção
   - **File size limit:** 50MB (ou conforme necessário)
4. Clique em "Create bucket"

### 6. Configurar políticas de segurança (RLS)
Para permitir uploads de imagens, execute estas queries no SQL Editor:

```sql
-- Habilitar RLS para o bucket
ALTER STORAGE hvac-images ENABLE ROW LEVEL SECURITY;

-- Criar política para uploads públicos
CREATE POLICY "Public images access" ON STORAGE.objects
FOR ALL USING (bucket_id = 'hvac-images');

-- Criar política para insert de imagens
CREATE POLICY "Enable image upload" ON STORAGE.objects
FOR INSERT WITH CHECK (bucket_id = 'hvac-images');

-- Criar política para select de imagens
CREATE POLICY "Enable image download" ON STORAGE.objects
FOR SELECT USING (bucket_id = 'hvac-images');
```

### 7. Testar a conexão
Após configurar tudo, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

O sistema estará pronto para usar com o Supabase!

## Estrutura do banco de dados

O schema SQL cria as seguintes tabelas:
- `users` - Usuários do sistema
- `clients` - Clientes atendidos
- `technicians` - Técnicos especializados
- `equipment` - Equipamentos cadastrados
- `service_requests` - Solicitações de serviço
- `pmoc_reports` - Relatórios PMOC
- `financial_transactions` - Transações financeiras
- `receipts` - Recibos gerados
- `report_images` - Imagens dos relatórios
- `inventory_items` - Itens de inventário
- `inventory_movements` - Movimentações de inventário

## Funcionalidades implementadas

### Upload de Imagens
- ✅ Upload de imagens para o Supabase Storage
- ✅ Compressão automática de imagens
- ✅ Validação de formato e tamanho
- ✅ Captura de fotos diretamente do celular
- ✅ Organização por pastas (reports, pmoc-reports/{id})
- ✅ Interface responsiva para upload

### PMOC com Imagens
- ✅ Relatórios PMOC com suporte a imagens
- ✅ Visualização de imagens no relatório
- ✅ Gerenciamento de imagens (adicionar/remover)
- ✅ Integração com o sistema existente
- ✅ Armazenamento seguro no Supabase

### Mobile Optimization
- ✅ Interface otimizada para dispositivos móveis
- ✅ Botão para capturar fotos com a câmera do celular
- ✅ Upload de imagens da galeria
- ✅ Visualização responsiva de imagens