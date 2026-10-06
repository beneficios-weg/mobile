# WEG Benefits Mobile

MVP para revisão: Svelte + TypeScript + Vite + Capacitor, Supabase Auth/API, cache SQLite Android, fila offline e módulo Kotlin de geofences com verificação curta de visitas.

## Preparação

Node >=22.12.0; backend Supabase local ou ambiente de homologação configurado.

```sh
npm ci
```

Copie `.env.example` para `.env.local` e configure URL e chave publishable/anon. Para web local, URL `http://127.0.0.1:54321`; para emulador Android, `http://10.0.2.2:54321`. Nunca use chaves secret/service_role no mobile.

```sh
npm run check
npm test
npm run dev
npm run android:sync
npm run android:open
```

Android exige JDK 21, SDK plataforma/build-tools 36 e dispositivo com Google Play Services. Em Windows, `npm run android:build` compila APK debug e executa testes Kotlin; Linux/macOS: `cd android && ./gradlew assembleDebug testDebugUnitTest` após sync. Não edite `dist` nem assets web copiados em `android`.

## Implementação e revisão

- [Escopo, regras iniciais, arquitetura e limites](docs/implementacao-mvp.md)
- [Backend implementado em branch separada](https://github.com/beneficios-weg/backend-api/tree/feat/confirmed-backend)
- [Telas e fluxos planejados](docs/telas-e-fluxos.md)
- [Contexto para agentes](AI_CONTEXT.md)

Fluxos: autenticação, catálogo, categorias/busca, mapa, detalhes, favoritos, visitas e monitoramento. Há estados offline/erro/vazio. Não existem dados de parceiros reais neste branch. A interface é uma base de revisão, ainda sem validação visual contra o Figma.

Parâmetros de visita, modelo inicial e conflitos estão documentados para revisão do tech lead. Não há Swift/iOS, identidade corporativa WEG, avaliações/comentários ou mapas offline. Geofences precisam de validação em aparelho e não funcionam após Force Stop até reabrir o aplicativo.

As páginas do scaffold inicial são histórico. Os READMEs antigos e documentos de planejamento não substituem o comportamento descrito em `docs/implementacao-mvp.md`.
