# Geolocalização

## Finalidades autorizadas

A localização é utilizada para:

- mostrar estabelecimentos próximos;
- calcular contexto de proximidade;
- posicionar e alimentar o mapa;
- fornecer sinais à detecção automática de visitas.

Não há previsão de armazenar permanentemente o trajeto. Os pontos usados durante a análise de visita são temporários e devem ser descartados após a janela necessária, preservando apenas o resultado exigido pelo contrato.

## Permissão

O aplicativo deve explicar o benefício antes ou no contexto do pedido de permissão. Os estados mínimos são:

| Estado | Comportamento esperado |
|---|---|
| Não solicitado | Pedir somente quando uma função de localização for usada |
| Concedido | Buscar posição adequada à função atual |
| Negado | Manter alternativas sem localização e explicar como habilitar |
| Bloqueado | Orientar abertura das configurações, sem repetir prompts |
| Indisponível | Informar limitação temporária e permitir nova tentativa |
| Precisão insuficiente | Não promover um ponto impreciso a visita confirmada |

## Uso no mapa e proximidade

A posição ajuda a ordenar ou contextualizar resultados próximos, mas estabelecimentos e coordenadas oficiais vêm do Backend. Distância calculada no dispositivo é informação derivada para UX; critérios e campos calculados pelo servidor continuam sob autoridade do Backend.

## Uso na detecção de visitas

A avaliação combina proximidade, cerca de três minutos, movimento, precisão, consistência e comparação entre candidatos. Um único ponto dentro de um raio não é suficiente. Veja [Detecção de visitas](deteccao-visitas.md).

## Privacidade e segurança

- coletar apenas a precisão e frequência necessárias;
- manter pontos brutos somente em memória ou armazenamento temporário durante a análise;
- nunca registrar coordenadas sensíveis em logs de produção;
- limpar a janela ao encerrar ou invalidar a análise;
- não usar QR Code, NFC, confirmação manual, BLE, UWB ou IA como substitutos;
- respeitar a decisão do usuário e a política de plataforma.

## Background

A necessidade, a política de consentimento, os limites de bateria e o comportamento em background são **DECISÃO PENDENTE**. Não documentar nem implementar monitoramento contínuo como se estivesse aprovado.

## Dependências pendentes

- biblioteca de localização e mapas;
- requisitos de permissão por plataforma;
- política de background;
- formato do evento aceito pelo Backend;
- parâmetros oficiais de distância e precisão, caso pertençam ao servidor.
