# Arquitetura mobile

## Estado

A arquitetura abaixo é **planejada** para a futura implementação mobile integrada. O checkout atual contém páginas Svelte/Vite e uma configuração Android do Capacitor. As interfaces de Início, Login, Categoria, Favoritos e Informações do Estabelecimento usam dados de apresentação locais; a API do produto não está integrada. O contrato conceitual das entidades está em [Modelo de dados](modelo-dados.md), e os tipos correspondentes ficam em `src/lib/domain.ts`.

Na estrutura executável atual, `src/App.svelte` monta as páginas a partir de `lib/routes.ts` e do estado reativo de `lib/navigation.svelte.ts`, que coordena a History API. `src/pages/` contém as composições e o catálogo demonstrativo, `src/components/` contém átomos/moléculas e o mapa, `src/lib/` contém tipos, navegação, estado de prévia e ações de animação e `src/services/` contém exemplos e adaptadores preparados. `src/main.ts` carrega uma única entrada de estilos de componentes; `DirectoryPage.css` compartilha o layout de Início/Categoria/Favoritos/Visitados. A estrutura planejada abaixo não exige migrar essas páginas para outro framework nesta revisão.

## Estrutura planejada

```text
src/
├── screens/       # Composição das telas e estados visuais
├── components/    # Componentes de UI reutilizáveis
├── navigation/    # Rotas e Floating Tab Bar
├── services/      # Cliente da API e adaptadores externos
├── state/         # Estado de sessão e dados compartilhados
├── storage/       # Cache, metadados e SYNC_QUEUE
├── hooks/         # Orquestração reutilizável de UI e domínio
├── utils/         # Funções puras, distância e formatação
├── types/         # Tipos alinhados ao contrato publicado
├── constants/     # Constantes sem segredos
└── theme/         # Tokens visuais e tipografia de sistema
```

Criar somente diretórios que tenham uso imediato. Esta árvore não obriga a adoção de todos eles no primeiro commit de implementação.

## Responsabilidades

| Camada | Responsabilidade | Não deve fazer |
|---|---|---|
| UI | Renderizar telas, feedback e acessibilidade | Chamar storage ou HTTP diretamente |
| API | Autenticar requisições, serializar e tratar respostas | Redefinir payloads ou regras do Backend |
| State | Coordenar sessão e estado compartilhado | Tornar todo estado global |
| Storage | Cache, `lastSyncAt` e fila offline | Escolher tecnologia antes da decisão registrada |
| Location | Permissão e amostras temporárias de posição | Persistir trajeto completo |
| Visit Detection | Avaliar sinais e produzir candidato de visita | Assumir aceite do Backend sem contrato |

## Fluxo de dados

1. A tela solicita dados por hook ou camada de estado.
2. O serviço consulta o Backend quando houver conexão.
3. Uma resposta válida atualiza estado e cache com `lastSyncAt`.
4. Em falha de rede, a UI usa cache elegível e identifica que o conteúdo pode estar desatualizado.
5. Uma mutação offline compatível com o contrato entra em `SYNC_QUEUE`.
6. A sincronização posterior processa a fila de forma controlada e registra sucesso ou erro.

## Navegação

A FloatingTabBar conecta Início, Favoritos e Visitados; Mapa abre um diálogo modal sobre a página atual. A prévia web usa History API e recursos reativos do Svelte, sem biblioteca adicional. Detalhes preservam o contexto de retorno, e a expansão do mapa mantém filtros, seleção, posição e zoom. Rotas, dados demonstrativos e limites estão em [Navegação implementada](navegacao.md). A integração nativa e a estratégia de autenticação continuam pendentes.

## Decisões técnicas ainda abertas

- uso definitivo de Expo e TypeScript;
- biblioteca de navegação e mapa;
- solução de estado compartilhado;
- mecanismo de storage;
- execução em background;
- segundo recurso nativo.

Consulte [Decisões abertas](decisoes-abertas.md).
