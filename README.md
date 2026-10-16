# WEG Benefits Mobile

Aplicativo corporativo mobile para colaboradores da WEG descobrirem benefícios em estabelecimentos parceiros próximos. A experiência é centrada em mapa, categorias, detalhes do estabelecimento, favoritos e histórico de visitas detectadas por geolocalização.

## Problema e solução

O produto responde à pergunta: **“Quais benefícios tenho perto de mim agora?”**. A solução planejada reúne descoberta por proximidade, busca e categorias, consulta do benefício principal de cada estabelecimento, favoritos independentes de visitas e detecção automática de visitas.

## Estado atual

Este checkout contém um starter Svelte/Vite com Capacitor, documentação do produto e tipos TypeScript para o domínio de dados. As telas do WEG Benefits e a integração com o Backend ainda não estão implementadas. React Native aparece como requisito na documentação anterior, mas não corresponde ao starter encontrado neste checkout; a decisão de stack continua pendente.

- Inter, Lucide Icons, componentes reutilizáveis e mapa central são diretrizes visuais/funcionais;
- o modelo lógico para categorias, marcas, estabelecimentos, benefícios, serviços, horários, favoritos, visitas e avaliações está em [Modelo de dados](docs/modelo-dados.md);
- os tipos em `src/lib/domain.ts` não definem payloads nem substituem o contrato oficial do Backend;
- autenticação, endpoints, mapa, armazenamento local e segundo recurso nativo permanecem como **DECISÃO PENDENTE**.

Consulte [Decisões abertas](docs/decisoes-abertas.md) antes de implementar.

## Escopo funcional

As sete telas previstas são Login, Início, Categoria, Loja/Estabelecimento, Favoritos, Mapa em tela cheia e Lojas visitadas. Recuperação de senha e primeiro acesso são fluxos auxiliares. A navegação principal utiliza uma Floating Tab Bar.

Veja [Telas e fluxos](docs/telas-e-fluxos.md) e [Componentes de UI](docs/componentes-ui.md).

## Stack e arquitetura

| Item | Situação |
|---|---|
| React Native | Requisito confirmado |
| Mobile-first | Requisito confirmado |
| Inter | Diretriz visual confirmada |
| Lucide Icons | Diretriz de iconografia confirmada |
| Expo, TypeScript, React Navigation | Citados em documentação ainda não integrada; validar antes de adotar |
| Mapas, storage e state management | **DECISÃO PENDENTE** |

A organização planejada e seus limites estão em [Arquitetura mobile](docs/arquitetura-mobile.md). Ela não representa código já existente.

## Instalação e execução

Os scripts reais estão em `package.json`. A configuração atual fornece `npm run dev`, `npm run build` e `npm run check` para o starter Svelte/Vite; esses comandos não representam ainda uma aplicação mobile de produto concluída.

## Variáveis de ambiente

Não há nomes de variáveis definidos nem arquivo `.env.example`. A configuração da URL base da API e quaisquer parâmetros públicos do provedor de mapas dependem das escolhas de implementação e do contrato do Backend. Segredos e tokens privados nunca devem ser versionados.

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
- [Componentes de UI](docs/componentes-ui.md)
- [Geolocalização](docs/geolocalizacao.md)
- [Detecção de visitas](docs/deteccao-visitas.md)
- [Offline e sincronização](docs/offline-sync.md)
- [Integração com a API](docs/integracao-api.md)
- [Modelo de dados](docs/modelo-dados.md)
- [Testes mobile](docs/testes-mobile.md)
- [Decisões abertas](docs/decisoes-abertas.md)
- [Contexto para agentes](AI_CONTEXT.md)
