# Habbo-like MVP — Iteração 4 (Espaços Públicos e Correções)

Esta iteração foca na estabilidade da interação entre usuários e na criação de espaços públicos temáticos para convivência.

## O que entrego agora (Iteração 4)

1. **Espaços Públicos** — Criação de instâncias globais como "Lobby Principal", "Café do Hotel" e "Piscina", acessíveis a todos pelo navegador.
2. **Correção de Bugs de Interação** — Ajustes na sincronização de estado (movimento fantasma), limpeza de bolhas de chat órfãs e validação de direção.
3. **UI de Espaços Públicos** — No Navegador, uma aba dedicada a quartos oficiais do hotel.
4. **Persistência de Presença** — Melhoria na lógica de `leave` do Realtime para garantir que avatares desapareçam imediatamente ao deslogar.

## Alterações Técnicas

- **Navigator:** Adição de uma seção de "Espaços Públicos" com IDs fixos (`public-lobby`, `public-cafe`, `public-pool`).
- **Realtime Logic:** Refatoração do hook `useMultiplayer` para lidar melhor com a latência de rede e interpolação básica de movimento para evitar "teleportes".
- **IsoRoom:** Ajuste no z-index e na ordem de renderização para evitar que avatares se sobreponham de forma errada em tiles específicos.

## Próximos Passos

Iniciarei as correções de bugs identificados e a atualização da lista de quartos no Navegador.
