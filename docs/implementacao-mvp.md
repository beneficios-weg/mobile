# Implementação mobile para revisão técnica

## O que foi implementado

Svelte + TypeScript + Vite + Capacitor, com componentes próprios, Inter embarcada e ícones Lucide. Fluxos: login, primeiro acesso, recuperação/alteração de senha, início, categorias, pesquisa, ordenação por nome/distância, detalhes/benefício, favoritos, mapa expandido, histórico e configurações de monitoramento. Estados de carregamento, vazio, erro, offline, cache e permissão negada.

A aparência é uma base de revisão dos fluxos documentados, não uma reprodução validada do Figma. Tokens, navegação e telas devem ser conferidos com o design. Mapa inicial: Leaflet/OpenStreetMap com atribuição; sem tiles offline. Provedor é uma decisão técnica inicial, não requisito previamente fechado. Para distribuição em escala, revisar política/capacidade do provedor ou contratar tiles apropriados.

Supabase fica numa camada de serviço; componentes de apresentação não acessam diretamente endpoints. `repository.ts` controla cache e fila. Android usa SQLite por ponte Kotlin; a prévia web usa IndexedDB e não substitui testes nativos. Sessões Android são cifradas AES-GCM com chave do Android Keystore; a prévia web usa sessionStorage. Senhas não são persistidas. Backup Android está desabilitado.

## Offline e sincronização

Cache por usuário: categorias, estabelecimentos, benefícios, favoritos, visitas, operações pendentes e `lastSyncAt`. O primeiro login requer internet. Dados já baixados permanecem consultáveis com sessão local existente; não há login offline novo. Logout limpa dados e fila do usuário e desativa monitoramento, inclusive offline, com confirmação se houver operações pendentes.

Favoritar/desfavoritar modifica o estado local e grava a intenção numa fila durável. Múltiplas intenções não enviadas da mesma loja são consolidadas. Visitas nativas têm UUID estável, permanecem na fila SQLite até confirmação do servidor e não dependem da WebView. A sincronização acontece ao abrir/retomar o app, ao reconectar, manualmente e a cada 30 segundos com interface ativa. Há serialização de gravações, proteção contra troca de conta, backoff exponencial e retenção de erros permanentes para revisão.

O catálogo é paginado, com limite inicial de 10.000 registros por recurso e erro explícito se excedido; não é uma solução de distribuição regional em larga escala. A regra de conflitos e limites do backend está em `backend-api/docs/implementacao-mvp.md`.

## Kotlin e geofences

- `BenefitsPlugin`: ponte de permissões, SQLite, sessão protegida, localização pontual, configuração e fila nativa.
- `GeofenceRegistry`: registra até 100 parceiros próximos, com `PendingIntent` mutável e receiver explícito; seleção é atualizada quando o usuário ativa o monitoramento.
- `GeofenceReceiver`: eventos do sistema iniciam uma sessão curta nativa, sem depender de JavaScript.
- `VisitService`: foreground service do tipo location, com notificação e timeout. Requer amostras precisas, permanência contínua, velocidade compatível e região não ambígua.
- `VisitWindow`: regra pura testável; lacunas, velocidade alta, imprecisão e fronteira incerta reiniciam a janela.
- `RestoreReceiver`: tenta restaurar geofences após reboot/atualização, se monitoramento e permissões continuarem válidos.
- SQLite guarda apenas o resumo do evento e cooldown; pontos de GPS ficam temporariamente em memória e são descartados. Amostras marcadas como simuladas são rejeitadas.

Valores iniciais ajustáveis, **a validar em campo**: aproximação 150m, visita 60m, permanência 180s, precisão até 30m, velocidade até 2m/s, lacuna máxima 15s, mínimo 6 amostras e cooldown 1h. A decisão de não confirmar regiões sobrepostas é conservadora. O SO pode atrasar geofences; o GPS não prova entrada física. Force Stop impede a entrega até reabrir o app. O conjunto de parceiros monitorados não é recalculado continuamente durante grandes deslocamentos; essa evolução é necessária para cobertura geográfica ampla.

Localização é solicitada por ação do usuário. Ativação explica o funcionamento e exige consentimento; a permissão de background precisa de “Permitir o tempo todo” nas configurações do Android. O app oferece caminho para as configurações e opção de desativar. Política corporativa de privacidade/retensão final ainda requer revisão.

## Preparação

```sh
npm ci
```

Copiar `.env.example` para `.env.local`; preencher a URL e chave publishable/anon do Supabase. Para navegador local usar `http://127.0.0.1:54321`; para o emulador Android, `http://10.0.2.2:54321`. Para aparelho físico usar endpoint acessível na rede ou HTTPS de homologação. Nunca usar secret/service_role no mobile.

Backend: branch `feat/confirmed-backend` do repositório `beneficios-weg/backend-api`; executar os comandos do README e cadastrar o catálogo administrativamente no Studio. Não há parceiros reais nem seed automático.

```sh
npm run check
npm test
npm run dev
npm run android:sync
npm run android:open
```

Android: SDK plataforma 36/build-tools 36, JDK 21 e Android Studio. Projeto usa Kotlin 2.2.0 e Play Services Location 21.3.0. Compilação Windows: `npm run android:build`; Linux/macOS: `cd android && ./gradlew assembleDebug testDebugUnitTest`. Dispositivo com Google Play Services necessário para geofences. HTTP só está permitido no manifest de debug; builds de distribuição devem usar HTTPS.

Live reload no emulador (apenas desenvolvimento): servidor Vite com `npm run dev -- --host 0.0.0.0`, depois `npx cap run android --live-reload --host 10.0.2.2 --port 5173`. Não persistir `server.url` no config de produção.

## Testes e limites

Checagem Svelte/TypeScript, testes de distância/conflitos, build web/sync e fluxos no navegador/Supabase local foram executados. Testes de navegador cobrem offline/reconexão, persistência e limpeza/isolamento de contas. A fila nativa e o comportamento físico de geofences precisam de testes em dispositivo.

Não foi implementado Swift/iOS (planejado para o futuro no histórico), SSO corporativo, avaliações/comentários (sem aprovação final), mapas offline nem antifraude. Esses itens não são apresentados como concluídos. A integração e publicação em Supabase remoto também não foram executadas.

As docs do scaffold inicial permanecem como histórico; esta página descreve a implementação atual.

## Resultado do build Android

APK debug gerado com sucesso em ambiente Docker local isolado, Java 21/Gradle 8.14.3, SDK 36. Os três testes Kotlin do detector passaram (mais o teste simples do scaffold). O container recebeu somente fontes e assets de build conferidos, sem logs de Supabase ou segredos. O build Windows foi bloqueado por uma falha de sockets locais do Java; isso não foi resolvido por alteração de segurança do sistema.

O APK de revisão usa `http://10.0.2.2:54321`, a chave pública do Supabase local e assinatura debug. Não é um artefato de distribuição/produção. Não foi instalado em aparelho/emulador nesta máquina, pois não havia dispositivo conectado. Testar permissões, persistência SQLite nativa, reinício, eventos de geofence, localização em segundo plano e consumo de bateria em aparelho real continua obrigatório.

Os testes de navegador também verificaram primeiro acesso, pedido de recuperação e logout offline. A recuperação completa via e-mail local/PKCE, atualização e login com a nova senha passaram no navegador. Os deep links Android ainda precisam de validação em dispositivo.
