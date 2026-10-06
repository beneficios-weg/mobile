# WEG Benefits Mobile

Base inicial do aplicativo WEG Benefits. Stack vigente: **Svelte + TypeScript + Vite + Capacitor**, com projeto Android versionado. Ainda não há telas nem funcionalidades de negócio.

## Instalação e execução

Pré-requisito: Node.js >= 22.12.0 (esta base foi gerada com Node 24.11.1 e npm 11.6.2).

```sh
npm ci
npm run check
npm run build
npm run dev
```

`npm run preview` serve o build web localmente.

## Android

```sh
npm run android:sync
npm run android:open
```

O primeiro comando gera o build web e executa `cap sync android`. O segundo abre o projeto no Android Studio, que deve estar instalado com SDK/JDK compatíveis. O identificador inicial é `br.com.beneficiosweg.mobile`, o nome é `WEG Benefits` e o diretório web é `dist`.

## Escopo desta base

Somente scaffold e configurações de desenvolvimento. Nenhuma tela, autenticação, regra de negócio, API, Supabase, SQLite, geofence ou lógica de localização foi implementada. Não há projeto iOS nem segredos/variáveis de ambiente necessários nesta etapa.

## Documentação

A [decisão do scaffold](docs/scaffold-inicial.md) substitui as referências históricas a React Native/Expo. Os demais documentos preservam o planejamento do produto; não comprovam funcionalidades implementadas.

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
- [Designs](designs/README.md)
- [Contexto para agentes](AI_CONTEXT.md)

O Backend permanece separado e é a fonte de verdade para contratos, dados e regras do servidor.

## Revisão da base completa

O backend foi inicializado com Supabase no repositório separado [backend-api, branch chore/verify-initial-base](https://github.com/beneficios-weg/backend-api/tree/chore/verify-initial-base). Consulte o README desse branch para instalar a CLI fixada e iniciar os serviços locais com Docker. Não há integração entre os projetos nem implementação de domínio nesta etapa.
