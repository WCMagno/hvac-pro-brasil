# 🌡️ HVAC Pro Brasil

Sistema completo de gerenciamento de manutenção HVAC e PMOC conforme Lei nº 13.589/2018, desenvolvido para profissionais do Brasil.

## ✨ Tecnologias Utilizadas

### 🎯 Core Framework
- **⚡ Next.js 15** - Framework React com App Router
- **📘 TypeScript 5** - Tipagem segura para melhor experiência de desenvolvimento
- **🎨 Tailwind CSS 4** - Framework CSS utilitário para desenvolvimento rápido de UI

### 🗄️ Database & Backend
- **🔥 Supabase** - Plataforma de backend como serviço com PostgreSQL
- **🔐 NextAuth.js** - Solução completa de autenticação
- **🔒 bcryptjs** - Hashing de senhas seguro

### 🧩 UI Components & Styling
- **🧩 shadcn/ui** - Componentes de alta qualidade baseados em Radix UI
- **🎯 Lucide React** - Biblioteca de ícones consistente
- **🌈 Framer Motion** - Biblioteca de animações para React
- **🎨 Next Themes** - Suporte perfeito para dark mode

### 📋 Forms & Validation
- **🎣 React Hook Form** - Formulários performáticos com validação fácil
- **✅ Zod** - Validação de schema com TypeScript

### 🔄 State Management & Data Fetching
- **🐻 Zustand** - Gerenciamento de estado simples e escalável
- **🔄 TanStack Query** - Sincronização de dados poderosa para React
- **🌐 Axios** - Cliente HTTP baseado em Promises

### 🎨 Advanced UI Features
- **📊 TanStack Table** - Headless UI para construir tabelas e datagrids
- **🖱️ DND Kit** - Kit moderno de drag and drop para React
- **📊 Recharts** - Biblioteca de gráficos construída com React e D3
- **🖼️ Sharp** - Processamento de imagens de alta performance

### 🌍 Real-time Communication
- **🔌 Socket.io** - Comunicação em tempo real bidirecional

## 🎯 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login seguro com JWT
- Controle de acesso baseado em papéis (Admin, Técnico, Cliente)
- Proteção de rotas com middleware
- Registro de usuários com validação

### 👥 Gestão de Usuários
- Cadastro de clientes, técnicos e administradores
- Perfis específicos para cada tipo de usuário
- Sistema de busca e filtragem
- Interface intuitiva para gestão

### 🔧 Gestão de Serviços
- Cadastro de serviços de manutenção
- Acompanhamento de status (Pendente, Em Andamento, Concluído, Cancelado)
- Sistema de prioridades
- Agendamento de serviços
- Atribuição de técnicos

### 📋 PMOC (Plano de Manutenção, Operação e Controle)
- Relatórios de PMOC conforme legislação
- Upload de fotos e documentos
- Sistema de observações e recomendações
- Controle de datas de manutenção

### 💰 Gestão Financeira
- Controle de receitas e despesas
- Emissão de recibos
- Acompanhamento de pagamentos
- Relatórios financeiros

### 📊 Dashboard & Relatórios
- Dashboard interativo com gráficos
- Relatórios detalhados
- Exportação de dados
- Análise de métricas

## 🚀 Configuração Rápida

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais do projeto
3. Configure o arquivo `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Configurar Database
Execute o schema SQL no Supabase Dashboard:
- Abra o arquivo `supabase-schema.sql`
- Copie e cole no SQL Editor do Supabase
- Execute o script

### 4. Iniciar Servidor
```bash
npm run dev
```

### 5. Criar Usuário Administrador
```bash
curl -X POST http://localhost:3000/api/create-admin -H "Content-Type: application/json"
```

### 6. Acessar o Sistema
Abra [http://localhost:3000](http://localhost:3000)
- **Email**: `admin@hvacpro.com.br`
- **Senha**: `admin#1234`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── financial/         # Financial management
│   ├── pmoc/              # PMOC management
│   ├── services/          # Service management
│   ├── users/             # User management
│   └── layout.tsx         # Root layout
├── components/             # Reusable React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── ui/                # shadcn/ui components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── auth/              # Authentication configuration
│   ├── supabase.ts        # Supabase client configuration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
    ├── index.ts           # Local type definitions
    └── next-auth.d.ts     # NextAuth type extensions
```

## 🎨 Componentes Disponíveis

### 🧩 UI Components (shadcn/ui)
- **Layout**: Card, Separator, Aspect Ratio, Resizable Panels
- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch
- **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
- **Navigation**: Breadcrumb, Menubar, Navigation Menu, Pagination
- **Overlay**: Dialog, Sheet, Popover, Tooltip, Hover Card
- **Data Display**: Badge, Avatar, Calendar, Table

### 📊 Recursos Avançados
- **Tabelas**: Tabelas poderosas com ordenação, filtragem, paginação
- **Gráficos**: Visualizações bonitas com Recharts
- **Formulários**: Formulários type-safe com React Hook Form + Zod
- **Upload de Imagens**: Sistema completo de upload com Supabase Storage

### 🎨 Recursos Interativos
- **Animações**: Micro-interações suaves com Framer Motion
- **Drag & Drop**: Funcionalidade moderna de arrastar e soltar
- **Theme Switching**: Suporte integrado para modo claro/escuro

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint

# Database
npm run db:setup     # Instruções para configurar o Supabase
npm run db:seed      # Instruções para criar usuário admin
npm run supabase:types # Gera tipos TypeScript do Supabase
```

## 🌍 Variáveis de Ambiente

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=Chave anônima do Supabase
SUPABASE_SERVICE_ROLE_KEY=Chave de serviço do Supabase

# NextAuth Configuration
NEXTAUTH_SECRET=Segredo do NextAuth
NEXTAUTH_URL=URL do aplicativo
```

## 🔒 Segurança

- Autenticação com JWT seguro
- Hashing de senhas com bcryptjs
- Proteção contra ataques CSRF
- Validação de entrada de dados
- Controle de acesso baseado em papéis
- Middleware de proteção de rotas

## 🚀 Deploy

O projeto está pronto para deploy em plataformas como:
- Vercel (recomendado)
- Netlify
- Railway
- Digital Ocean App Platform

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

Desenvolvido com ❤️ para profissionais HVAC do Brasil. 🌡️