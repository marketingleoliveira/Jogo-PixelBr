# Habbo-like MVP — Iteração 2 (Multiplayer Online)

Esta iteração transforma o motor isométrico em um ambiente multiplayer em tempo real, permitindo que usuários se encontrem, conversem e se movam no mesmo espaço.

## O que entrego agora (Iteração 2)

1. **Multiplayer via Realtime** — Sincronização de posição e chat entre todos os usuários ativos no quarto usando Supabase Realtime (Broadcast/Presence).
2. **Presença Global** — Lista visual de outros avatares no quarto com animações de movimento suaves.
3. **Chat Coletivo** — Balões de fala visíveis para todos, permitindo interação social.
4. **Lobby Público** — A rota `/room` agora funciona como um lobby compartilhado onde todos os usuários logados aparecem juntos.
5. **Otimização de Renderização** — Melhorias no loop de animação para lidar com múltiplos avatares sem perda de performance.

## Alterações Técnicas

- **Realtime (Presence):** Uso do `supabase.channel('lobby')` para rastrear quem está online, sua posição atual e aparência.
- **Broadcast:** Envio de eventos de chat para todos os participantes do canal.
- **Componente `IsoRoom`:** Refatorado para aceitar uma lista de `others` (outros jogadores) e renderizá-los dinamicamente.
- **Hook `useMultiplayer`:** Novo hook para encapsular a lógica de inscrição, sincronização de estado e limpeza de conexões.

## Próximos Passos

Iniciarei a refatoração do backend para garantir que as permissões de leitura permitam a descoberta de outros perfis e atualizarei o frontend para o estado multiplayer.
