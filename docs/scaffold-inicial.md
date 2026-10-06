# Scaffold inicial — 2026-10-06

## Decisão vigente

Por instrução do responsável pelo projeto, a base mobile usa Svelte + TypeScript + Vite + Capacitor. Isso substitui as referências anteriores a React Native, Expo e React Navigation na documentação histórica. O prazo e o tamanho da equipe citados anteriormente não orientam este scaffold.

Foi usado o template oficial `create-vite@9.2.1` (`svelte-ts`), removendo exemplos, contador, imagens e estilos de demonstração. Capacitor core/CLI/Android estão fixados em 8.5.2; as demais versões resolvidas estão no `package-lock.json`.

## Divergência registrada

- Documentação anterior: React Native obrigatório e repositório somente documental.
- Estado atual: scaffold Svelte/TypeScript/Vite, configuração Capacitor e projeto Android gerado.
- Impacto: comandos e estrutura de inicialização anteriores não se aplicam mais.
- Resolução: seguir esta decisão e os comandos do README. As descrições de telas, domínio e arquitetura futura continuam como planejamento, sem implementação.

## Limites

Não há telas, regras de negócio, integração com API/Supabase, SQLite, geofences, localização nativa ou plataforma iOS. `src/App.svelte` é um componente vazio. O Android contém apenas o código e os recursos produzidos pelo Capacitor.

`br.com.beneficiosweg.mobile` é o identificador técnico inicial do scaffold, sem representar aprovação de publicação nas lojas. Nome/identificador podem ser ajustados antes da distribuição.

## Android

Versionar o projeto nativo, recursos e Gradle Wrapper. Não versionar `node_modules`, `dist`, assets web copiados pelo sync, builds, configuração local do SDK, caches ou chaves de assinatura. Após clonar, executar `npm ci` e `npm run android:sync`.

A geração/sincronização do projeto não equivale à compilação de APK. Para compilar e executar Android, preparar Android Studio, SDK e JDK conforme a versão do Capacitor: https://capacitorjs.com/docs/getting-started/environment-setup.

## Validações desta inicialização

- `npm ci`: instalação pelo lockfile concluída.
- `npm run check`: sem erros ou avisos Svelte; configurações TypeScript verificadas.
- `npm run build`: build web concluído.
- `npx cap add android`: projeto Android oficial gerado.
- `npm run android:sync`: build e sync Android concluídos após reinstalação.
- APK não compilado: SDK Android ausente e Java disponível 8, incompatível com a ferramenta Android atual.
- `npm audit`: três alertas moderados na cadeia de desenvolvimento `@capacitor/cli -> xcode -> uuid`. Mantida a versão estável 8.5.2 sem downgrade automático nem override de dependências. Nenhum alerta nas dependências de produção.
