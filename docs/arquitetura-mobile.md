# Arquitetura mobile

> Atualização de 2026-10-06: a stack vigente é Svelte + TypeScript + Vite + Capacitor. Consulte [Scaffold inicial](scaffold-inicial.md). As referências a React Native/Expo abaixo são históricas; a arquitetura funcional permanece planejada.

## Estado

A arquitetura abaixo é **planejada**, não encontrada no código. Na consolidação não existiam `package.json` nem diretório `src/`. Ela serve como limite simples para iniciar o React Native sem overengineering.

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
└── theme/         # Tokens visuais, incluindo Inter
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

A Floating Tab Bar representa os destinos principais definidos pelo design vigente. Telas de detalhe e mapa expandido devem preservar o contexto de origem. A biblioteca e o mapa exato de rotas são **DECISÃO PENDENTE** até a implementação e os protótipos serem disponibilizados.

## Decisões técnicas ainda abertas

- uso definitivo de Expo e TypeScript;
- biblioteca de navegação e mapa;
- solução de estado compartilhado;
- mecanismo de storage;
- execução em background;
- segundo recurso nativo.

Consulte [Decisões abertas](decisoes-abertas.md).
