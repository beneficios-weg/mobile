# Contexto para agentes — WEG Benefits Mobile

## Missão e limites

Este é o repositório **frontend mobile** do WEG Benefits. Trabalhe somente nele. O repositório Backend é separado e é a fonte de verdade para modelo de dados, DER, banco, endpoints, payloads, códigos HTTP, autenticação, validações e campos calculados.

> Nunca alterar o contrato da API no repositório Mobile sem alinhamento com o repositório Backend.

Em conflito entre documentação e implementação, não corrija silenciosamente. Registre comportamento documentado, comportamento encontrado, impacto e recomendação; use **DECISÃO PENDENTE** quando a resolução depender da equipe.

## Contexto confirmado

- Aplicativo Svelte + TypeScript + Vite + Capacitor, mobile-first (decisão de 2026-10-06).
- Iniciar somente o scaffold mínimo; não implementar funcionalidades nesta etapa.
- Tipografia Inter e Lucide Icons.
- Componentes reutilizáveis e mapa como elemento central.
- Sete telas: Login, Início, Categoria, Loja, Favoritos, Mapa em tela cheia e Lojas visitadas.
- Favoritos são independentes de visitas.
- Um benefício principal por estabelecimento no MVP.
- Geolocalização apoia proximidade, mapa e detecção automática de visitas.
- Não usar QR Code, NFC, confirmação manual, BLE, UWB ou IA para detectar visitas.
- Pontos GPS de análise são temporários; não persistir trajetos completos.

## Decisão vigente em 2026-10-06

Consulte [Scaffold inicial](docs/scaffold-inicial.md). A base executável e o Android estão presentes; React Native/Expo são referências históricas superadas. Demais requisitos permanecem planejamento.

## Estado histórico do repositório em 2026-09-29

Na consolidação, a branch base continha somente um README de uma linha. Não havia código, `package.json`, testes ou designs versionados. Uma branch remota documental citava Expo, TypeScript e React Navigation, mas esses itens não são verificáveis como implementação. Trate a estrutura descrita em `docs/arquitetura-mobile.md` como planejada.

## Regras para futuras mudanças

1. Verifique o contrato publicado pelo Backend antes de criar tipos, serviços ou mocks de integração.
2. Não transforme exemplos de endpoints desta documentação em contrato.
3. Mantenha estados de loading, vazio, erro e offline em cada fluxo remoto.
4. Separe UI, API, storage, localização e detecção de visitas.
5. Não escolha biblioteca de mapas, mecanismo de storage, solução de background ou segundo recurso nativo sem registrar a decisão.
6. Atualize a documentação quando uma decisão pendente for tomada ou a implementação divergir dela.

## Leituras prioritárias

- `docs/decisoes-abertas.md`
- `docs/integracao-api.md`
- `docs/offline-sync.md`
- `docs/deteccao-visitas.md`
