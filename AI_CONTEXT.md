# Contexto para agentes — WEG Benefits Mobile

## Missão e limites

Este é o repositório **frontend mobile** do WEG Benefits. Trabalhe somente nele. O repositório Backend é separado e é a fonte de verdade para modelo de dados, DER, banco, endpoints, payloads, códigos HTTP, autenticação, validações e campos calculados.

> Nunca alterar o contrato da API no repositório Mobile sem alinhamento com o repositório Backend.

Em conflito entre documentação e implementação, não corrija silenciosamente. Registre comportamento documentado, comportamento encontrado, impacto e recomendação; use **DECISÃO PENDENTE** quando a resolução depender da equipe.

## Contexto confirmado

- Aplicativo React Native, mobile-first.
- Equipe de quatro pessoas e cerca de 30 horas totais: evitar overengineering.
- Tipografia de sistema, seguindo a página de categorias: `-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif`. Lucide Icons para iconografia.
- Não substituir a fonte por Inter nem baixar outra fonte por suposição. Se o protótipo ou o padrão existente não esclarecer um detalhe visual, confirmar com o solicitante antes de escolher.
- Componentes reutilizáveis e mapa como elemento central.
- Sete telas: Login, Início, Categoria, Loja, Favoritos, Mapa em tela cheia e Lojas visitadas.
- Favoritos são independentes de visitas.
- Um benefício principal por estabelecimento no MVP.
- Geolocalização apoia proximidade, mapa e detecção automática de visitas.
- Não usar QR Code, NFC, confirmação manual, BLE, UWB ou IA para detectar visitas.
- Pontos GPS de análise são temporários; não persistir trajetos completos.

## Estado do repositório em 2026-10-16

O checkout contém um starter Svelte/Vite com Capacitor, documentação e tipos de domínio em `src/lib/domain.ts`. As telas reais, integração da API, testes de produto e designs versionados ainda não estão implementados. A stack mobile final permanece pendente e não deve ser chamada de React Native na implementação encontrada.

## Regras para futuras mudanças

1. Use `docs/modelo-dados.md` como modelo lógico para a UI; os tipos em `src/lib/domain.ts` não são payloads oficiais.
2. Verifique o contrato publicado pelo Backend antes de criar serviços ou mocks de integração.
3. Não transforme exemplos de endpoints desta documentação em contrato.
4. Mantenha estados de loading, vazio, erro e offline em cada fluxo remoto.
5. Separe UI, API, storage, localização e detecção de visitas.
6. Não escolha biblioteca de mapas, mecanismo de storage, solução de background ou segundo recurso nativo sem registrar a decisão.
7. Atualize a documentação quando uma decisão pendente for tomada ou a implementação divergir dela.

## Leituras prioritárias

- `docs/decisoes-abertas.md`
- `docs/integracao-api.md`
- `docs/offline-sync.md`
- `docs/deteccao-visitas.md`
