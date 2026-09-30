# Detecção automática de visitas

## Objetivo

Reconhecer uma visita sem QR Code, NFC, confirmação manual, BLE, UWB ou IA. O Mobile analisa temporariamente sinais de localização; a autoridade final e a persistência do evento devem respeitar o contrato do Backend.

## Sinais necessários

- proximidade de um estabelecimento candidato;
- permanência de aproximadamente três minutos;
- movimento compatível;
- precisão aceitável do GPS;
- consistência entre amostras;
- comparação entre candidatos quando houver sobreposição.

O briefing não define valores finais de raio, tolerância, quantidade de amostras, intervalo ou desempate. Esses parâmetros são **DECISÃO PENDENTE** e podem depender do Backend.

## Fluxo conceitual

1. Receber uma amostra de localização com horário e precisão.
2. Descartar amostras inválidas ou insuficientemente precisas conforme regra aprovada.
3. Identificar estabelecimentos candidatos a partir dos dados do Backend.
4. Atualizar uma janela temporária de observação.
5. Comparar candidatos por proximidade, tempo, movimento, precisão e consistência.
6. Quando todos os critérios aprovados forem satisfeitos, produzir um candidato de visita.
7. Enviar ou enfileirar o evento somente no formato contratado pelo Backend.
8. Após conclusão, expiração ou invalidação, descartar os pontos brutos.

## Estados conceituais

| Estado | Significado |
|---|---|
| `idle` | Nenhum candidato em análise |
| `observing` | Janela temporária em formação |
| `candidate` | Um ou mais estabelecimentos sob comparação |
| `eligible` | Critérios locais aprovados; ainda depende do fluxo contratado |
| `queued` | Evento aguardando sincronização permitida |
| `synced` | Backend aceitou o evento conforme contrato |
| `discarded` | Janela inválida, expirada ou inconsistente |

Esses nomes servem à documentação e não definem enums da API.

## Casos que não confirmam visita

- ponto isolado dentro da área;
- permanência inferior ao critério aprovado;
- precisão insuficiente;
- deslocamento incompatível;
- alternância instável entre candidatos;
- ausência de contrato para envio;
- localização simulada ou condição de plataforma que a política futura rejeite.

## Sobreposição de estabelecimentos

Quando vários candidatos competirem, comparar a série de sinais, não apenas a menor distância de uma amostra. A regra exata de dominância não foi fornecida e deve ser alinhada com o Backend antes de implementação.

## Offline

Se o contrato permitir envio posterior, o evento mínimo pode entrar em `SYNC_QUEUE`; pontos brutos não entram na fila. Idempotência, deduplicação, prazo máximo e tratamento de conflito são dependências do Backend.

## Critérios de aceite documental

- nenhuma confirmação manual faz parte do fluxo;
- favoritos nunca são usados como evidência de visita;
- pontos brutos não são histórico de trajeto;
- “elegível localmente” não é apresentado como “sincronizado”;
- regras numéricas não são inventadas no Mobile.
