# 👾 Jogo-PixelBr (My Virtual World)

> Um mundo virtual interativo no estilo Habbo Hotel, focado em multiplayer, movimentação de avatares, salas customizáveis e interação em tempo real.

🌐 **Demo ao Vivo:** [https://pixelbr.lovable.app](https://pixelbr.lovable.app)

---

## 📌 Sobre o Projeto

O **Jogo-PixelBr** é uma aplicação web inspirada em jogos clássicos de pixel art e comunidades virtuais como o *Habbo Hotel*. O objetivo principal é proporcionar uma experiência imersiva onde usuários podem navegar por ambientes 2D/isométricos, interagir com elementos do mapa e se comunicar em tempo real.

O projeto utiliza uma arquitetura moderna com **React + TypeScript + Vite**, suporte a **Supabase** para gerenciamento de dados/autenticação e scripts customizados em **Python** para depuração de físicas e movimentação.

---

## 🛠️ Tech Stack & Arquitetura

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Router / Query
- **Backend & Database:** Supabase (Auth, Realtime, Database)
- **Gerenciador de Pacotes & Runtime:** Bun / Node.js
- **Tooling & Linter:** ESLint, Prettier, Lovable.app
- **Depuração & Utility:** Python (`debug_movement.py`)

---

## 📂 Estrutura do Repositório

```text
├── .lovable/              # Configurações do ambiente Lovable
├── public/                # Assets estáticos (sprites, áudios, imagens)
├── src/                   # Código fonte da aplicação
│   ├── components/        # Componentes React reutilizáveis (UI, modais, etc.)
│   ├── hooks/             # Custom hooks para lógica de jogo e estado
│   ├── pages/             # Páginas da aplicação
│   └── services/          # Conexão com Supabase e APIs
├── supabase/              # Configurações, migrations e funções Supabase
├── debug_movement.py      # Script Python para testes de colisão e movimentação
├── AGENTS.md              # Instruções e diretrizes para agentes de IA
├── package.json
└── vite.config.ts
