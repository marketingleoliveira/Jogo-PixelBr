# Habbo-like MVP — Iteração 1

Um jogo grande como Habbo leva várias iterações. Nesta primeira, entrego a base jogável e depois evoluímos.

## O que entrego agora (Iteração 1)

1. **Design system pixelado** — tipografia Volter-like, paleta amarela/laranja/azul característica, UI em painéis com bordas duras.
2. **Landing page** — hero com logo do hotel, CTA "Entrar no Hotel", capturas do quarto.
3. **Autenticação** (Lovable Cloud) — email/senha + Google. Após login, redireciona para criação de avatar.
4. **Criação de avatar** — escolher nome (habbo name), gênero, cor de cabelo, roupa, cor de pele. Preview em pixel art gerado por CSS/SVG.
5. **Quarto isométrico single-player** — grid 10x10 em CSS 3D transform, chão em tiles, personagem que anda ao clicar num tile (pathfinding A*).
6. **Chat com balões** — input embaixo, mensagens aparecem como bubbles em cima do avatar por 6s.
7. **Persistência** — perfil, aparência e última posição salvos no Cloud.

## Fora do escopo desta iteração (próximas)

- Multiplayer em tempo real (avatares de outros jogadores no mesmo quarto via Realtime).
- Catálogo de mobiliário / colocar móveis / rodar / empilhar.
- Hotel público com lista de quartos, criar quartos próprios.
- Inventário, moedas (créditos/duckets), loja.
- Missões, badges, amigos.

Cada bloco acima vira uma iteração.

## Arquitetura técnica

- **Frontend:** TanStack Start já configurado. Rotas: `/` (landing), `/auth`, `/_authenticated/create-avatar`, `/_authenticated/room` (quarto do jogador).
- **Backend:** Lovable Cloud.
  - Tabela `profiles` (id → auth.users, habbo_name unique, gender, figure jsonb com hair/hair_color/shirt/shirt_color/skin, motto, last_x, last_y).
  - Trigger `handle_new_user` cria profile em signup.
  - RLS: qualquer autenticado lê profiles (necessário p/ multiplayer futuro), só o dono altera o próprio.
- **Isométrico:** projeção 2:1 em CSS (`transform: rotateX(60deg) rotateZ(-45deg)`), tiles como divs absolutos posicionados por (x,y). Personagem = sprite CSS/SVG com direção (8 direções) baseada no vetor de movimento.
- **Pathfinding:** A* simples em JS sobre o grid, animando célula por célula com `requestAnimationFrame`.
- **Sprite do avatar:** montado em runtime por SVG parametrizado (camadas: skin → shirt → hair) — evita depender de spritesheets externos e mantém customização real.

## Próxima resposta minha

Habilito o Lovable Cloud, crio a tabela de profiles, monto o design system pixelado, as rotas de auth/criação de avatar e o quarto isométrico jogável com chat.