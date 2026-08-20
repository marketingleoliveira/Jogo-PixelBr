# Habbo-like MVP — Iteração 3 (Navegação de Quartos e Tutorial)

Esta iteração introduz a capacidade de navegar entre quartos de diferentes usuários e um guia inicial para novos jogadores.

## O que entrego agora (Iteração 3)

1. **Navegador de Quartos (Navigator)** — Um menu lateral ou modal para listar usuários online e seus respectivos quartos, permitindo "visitar" outros espaços.
2. **Tutorial Inicial** — Um guia passo a passo (popup pixelado) que ensina o usuário a andar, falar e usar o navegador para encontrar amigos.
3. **Instâncias de Quartos** — Suporte para carregar o estado de diferentes quartos baseados no ID do proprietário.
4. **UI de Navegação** — Botão de "Menu/Quartos" no HUD principal.

## Alterações Técnicas

- **Rotas:** Atualização da rota `/_authenticated/room` para aceitar um parâmetro opcional de ID de usuário (`/_authenticated/room/$userId`).
- **Componente `Navigator`:** Nova interface para visualizar quem está online e trocar de instância de quarto.
- **Componente `Tutorial`:** Sistema de steps simples armazenado no `localStorage` ou estado local para guiar o primeiro acesso.
- **Realtime (Canais Dinâmicos):** Inscrição em canais baseados no ID do quarto (`room:userId`) em vez de um `lobby` global único, permitindo isolamento entre salas.

## Próximos Passos

Começarei implementando a lógica de rotas dinâmicas e o componente de menu para navegação.
