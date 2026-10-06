# Kotlin e geofences — escopo da entrega

Esta branch mantém somente o scaffold e o módulo Android. Não implementa telas, autenticação, Supabase, catálogo, mapas nem sincronização remota. O backend voltou à base anterior à implementação funcional; conteúdo preexistente foi preservado.

## Arquivos e comportamento

Em `android/app/src/main/java/br/com/beneficiosweg/mobile/location/`: `BenefitsPlugin.kt` expõe o módulo ao Capacitor; `GeofenceRegistry.kt` registra/remove até 100 regiões; `GeofenceReceiver.kt` recebe transições e contém restauração após reboot/atualização; `VisitService.kt` executa uma sessão curta de localização com notificação; `VisitRules.kt` avalia permanência, precisão, velocidade e continuidade. `LocalDatabase.kt` é suporte interno SQLite para configuração, cooldown e eventos pendentes, sem cache de aplicação ou sessão de autenticação.

O serviço rejeita amostras simuladas/antigas e regiões ambíguas, mantém pontos GPS somente em memória e persiste apenas resumos. Não existe envio de eventos a servidor. Região fora do raio, imprecisão, velocidade excessiva ou lacuna reiniciam a janela de permanência.

## Contrato de integração futura

Plugin Capacitor `BenefitsNative`, registrado em `MainActivity`. Métodos: `requestLocation()`, `openSettings()`, `status()`, `position()`, `startMonitoring({configuration})`, `stopMonitoring()`, `pendingVisits({owner})`, `acknowledgeVisit({owner,id})` e `clearOwner({owner})`.

O integrador deve solicitar localização precisa e obter a permissão de background nas configurações Android antes de ativar. Nenhuma interface de ativação é fornecida nesta entrega. `owner` é um identificador de namespace local, não autenticação. Antes de trocar o owner ou limpar seus dados, chamar `stopMonitoring()`.

Exemplo de configuração (valores iniciais para avaliação em campo):

```json
{
  "owner": "teste-local",
  "dwellMs": 180000,
  "maxAccuracy": 30,
  "maxSpeed": 2,
  "maxGapMs": 15000,
  "minimumSamples": 6,
  "cooldownMs": 3600000,
  "regions": [{
    "id": "regiao-teste",
    "latitude": -26.48,
    "longitude": -49.07,
    "geofenceRadius": 150,
    "visitRadius": 60
  }]
}
```

IDs devem identificar regiões distintas. O integrador fornece até 100 regiões; seleção por proximidade e renovação contínua não são implementadas. Eventos pendentes têm `id` UUID, `establishmentId` (ID da região), `detectedAt` em milissegundos Unix e `dwellMs`. Só confirmar/remover um evento depois de consumi-lo duravelmente.

## Build e testes

`npm ci`, `npm run check`, `npm run android:sync`. Android usa JDK 21, SDK/build-tools 36, Kotlin 2.2.0 e Play Services Location 21.3.0. Em `android`, executar `gradlew.bat assembleDebug testDebugUnitTest` no Windows ou `./gradlew assembleDebug testDebugUnitTest` no Linux/macOS.

Testes de regras em `android/app/src/test/java/br/com/beneficiosweg/mobile/location/VisitWindowTest.kt`. Build e testes unitários não substituem teste físico. Não havia aparelho/emulador conectado: permissões, eventos reais, reboot, segundo plano, persistência nativa e bateria continuam sem validação em dispositivo. Google Play Services é necessário. O SO pode atrasar geofences e Force Stop bloqueia entrega até reabrir. GPS não prova uma visita física. Swift/iOS não faz parte deste escopo.
