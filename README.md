# WEG Benefits Mobile

Aplicativo corporativo mobile para colaboradores da WEG descobrirem benefícios em estabelecimentos parceiros próximos. A experiência é centrada em mapa, categorias, detalhes do estabelecimento, favoritos e histórico de visitas detectadas por geolocalização.

## Problema e solução

O produto responde à pergunta: **“Quais benefícios tenho perto de mim agora?”**. A solução planejada reúne descoberta por proximidade, busca e categorias, consulta do benefício principal de cada estabelecimento, favoritos independentes de visitas e detecção automática de visitas.

## Estado atual

Este checkout implementa interfaces em Svelte 5, TypeScript e Vite, com um projeto Android do Capacitor. Há páginas de Início, Login, Categoria, Favoritos, Visitados, Informações do Estabelecimento e uma galeria de componentes. Os dados são demonstrativos: autenticação, API, persistência de favoritos, histórico real de visitas e sincronização ainda não estão integrados. React Native aparece como requisito histórico; não é a implementação encontrada neste repositório.

- tipografia de sistema conforme a página de categorias, Lucide Icons, componentes reutilizáveis e mapa central são diretrizes visuais/funcionais;
- o modelo lógico para categorias, marcas, estabelecimentos, benefícios, serviços, horários, favoritos, visitas e avaliações está em [Modelo de dados](docs/modelo-dados.md);
- os tipos em `src/lib/domain.ts` não definem payloads nem substituem o contrato oficial do Backend;
- o mapa implementado usa Leaflet; autenticação, endpoints, armazenamento local e segundo recurso nativo permanecem como **DECISÃO PENDENTE**.

Consulte [Decisões abertas](docs/decisoes-abertas.md) antes de implementar.

## Escopo funcional

As sete telas previstas são Login, Início, Categoria, Loja/Estabelecimento, Favoritos, Mapa em tela cheia e Lojas visitadas. Recuperação de senha e primeiro acesso são fluxos auxiliares. A navegação principal utiliza uma Floating Tab Bar.

Veja [Telas e fluxos](docs/telas-e-fluxos.md) e [Componentes de UI](docs/componentes-ui.md).

## Stack e arquitetura

| Item | Situação |
|---|---|
| Svelte 5, TypeScript e Vite | Implementados neste checkout |
| Capacitor | Configuração Android presente; validação nativa separada da validação web |
| React Native | Requisito histórico; não implementado |
| Mobile-first | Requisito confirmado |
| Tipografia | Mesma pilha de Categorias: `-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif` |
| Lucide Icons | Diretriz de iconografia confirmada |
| Expo e React Navigation | Não utilizados neste checkout |
| Mapas | Leaflet e tiles OpenStreetMap, com o mesmo componente no Início, Categoria, Favoritos e detalhe |
| Storage e state management de produto | **DECISÃO PENDENTE**; os exemplos usam estado local do Svelte |

A estrutura atual e a arquitetura planejada estão em [Arquitetura mobile](docs/arquitetura-mobile.md). A adoção final da stack mobile continua como decisão da equipe.

## Instalação e execução

Use `npm ci` para instalar as dependências, `npm run dev` para iniciar o servidor, `npm run check` para validar Svelte/TypeScript, `npm test` para os testes de regressão e `npm run build` para gerar `dist/`.

Rotas disponíveis: `/`, `/login`, `/categoria/:slug`, `/favoritos`, `/visitados`, `/estabelecimento/:id` e `/componentes-preview`. As sete categorias do Início abrem suas listas e os cards abrem os detalhes correspondentes. A galeria de componentes possui sua própria rota e não substitui o Início. Visitados reutiliza a composição de Categorias, com exemplos locais para revisão visual. Mapa expande a visualização atual sem uma rota própria. Veja os caminhos, retorno e limites em [Navegação](docs/navegacao.md).

Entrar no Login abre o Início como prévia, conforme autorizado pelo solicitante; não autentica nem armazena credenciais. Favoritos e estados de busca/filtro são compartilhados em memória durante a navegação e reiniciados ao recarregar. Para acesso direto às rotas em produção, configure o servidor para entregar `index.html` nos caminhos da aplicação.

## Variáveis de ambiente

`VITE_OSRM_URL` configura o serviço de rotas preparado em `src/services/routingService.ts`; o padrão de demonstração é `https://router.project-osrm.org`. Esse serviço e a geolocalização ainda não são chamados pelas páginas atuais. Não há URL da API do produto definida. Segredos e tokens privados nunca devem ser versionados.

## API e dados

O Backend é a fonte de verdade para modelo de dados, endpoints, payloads, códigos HTTP, autenticação, validações e campos calculados. Este repositório descreve somente como o aplicativo deverá consumir esse contrato. Como o contrato publicado não foi disponibilizado nesta consolidação, a matriz de consumo está marcada para confirmação em [Integração com a API](docs/integracao-api.md).

## Localização e funcionamento offline

- [Geolocalização](docs/geolocalizacao.md)
- [Detecção de visitas](docs/deteccao-visitas.md)
- [Cache e sincronização offline](docs/offline-sync.md)

Os pontos GPS usados na análise são temporários; esta documentação não prevê armazenamento permanente de trajetos.

## Design

Há uma referência de Figma registrada na documentação remota anterior: [App — Benefícios](https://www.figma.com/design/fQtw5ogzbaQfkSDZHVeeRI). O acesso e a correspondência com a versão vigente não foram validados. Consulte [designs/README.md](designs/README.md).

## Índice da documentação

- [Visão geral](docs/visao-geral.md)
- [Arquitetura mobile](docs/arquitetura-mobile.md)
- [Telas e fluxos](docs/telas-e-fluxos.md)
- [Navegação implementada](docs/navegacao.md)
- [Componentes de UI](docs/componentes-ui.md)
- [Geolocalização](docs/geolocalizacao.md)
- [Detecção de visitas](docs/deteccao-visitas.md)
- [Offline e sincronização](docs/offline-sync.md)
- [Integração com a API](docs/integracao-api.md)
- [Modelo de dados](docs/modelo-dados.md)
- [Testes mobile](docs/testes-mobile.md)
- [Decisões abertas](docs/decisoes-abertas.md)
- [Contexto para agentes](AI_CONTEXT.md)
- [Revisão e limpeza do código](docs/revisao-codigo.md)
