# WEG Benefits Mobile

Aplicativo corporativo mobile para colaboradores da WEG descobrirem benefícios em estabelecimentos parceiros próximos. A experiência é centrada em mapa, categorias, detalhes do estabelecimento, favoritos e histórico de visitas detectadas por geolocalização.

## Problema e solução

O produto responde à pergunta: **“Quais benefícios tenho perto de mim agora?”**. A solução planejada reúne descoberta por proximidade, busca e categorias, consulta do benefício principal de cada estabelecimento, favoritos independentes de visitas e detecção automática de visitas.

## Estado atual

Este repositório contém, neste momento, somente a documentação consolidada. Não há `package.json`, código React Native, testes, arquivos de configuração nem designs versionados na branch base. Por isso:

- React Native e a abordagem mobile-first são requisitos confirmados;
- Inter, Lucide Icons, componentes reutilizáveis e mapa central são diretrizes confirmadas;
- Expo, TypeScript e React Navigation aparecem em uma branch documental remota, mas ainda não podem ser validados na implementação;
- instalação, execução, variáveis de ambiente, biblioteca de mapas, armazenamento local e segundo recurso nativo permanecem como **DECISÃO PENDENTE**.

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

Ainda não existem comandos verificáveis. O repositório não possui `package.json` e, portanto, não é correto documentar `npm install`, `npm start` ou comandos Expo como se estivessem disponíveis.

Quando a implementação for inicializada, atualizar esta seção exclusivamente com scripts presentes em `package.json`, incluindo pré-requisitos e versões suportadas.

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
- [Testes mobile](docs/testes-mobile.md)
- [Decisões abertas](docs/decisoes-abertas.md)
- [Contexto para agentes](AI_CONTEXT.md)
