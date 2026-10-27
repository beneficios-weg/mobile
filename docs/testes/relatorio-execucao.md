# Relatório de execução de testes

## Identificação

| Campo | Valor |
|---|---|
| Data | 2026-10-27, fuso America/Sao_Paulo |
| Código de referência | `0c441910a9d5f9b60048ad668a778b286fea4c4a` |
| Branch de origem | `fix/equal-collapsed-info-cards` |
| Branch da documentação | `docs/system-testing`, sem alteração do código da aplicação |
| Executor | Agente Codex, execução local via PowerShell |
| Ambiente | Windows, Node `24.11.1`, npm `11.6.2`, dependências previamente instaladas |
| Bibliotecas observadas | Svelte `5.57.1`, Vite `8.3.2`, TypeScript `6.0.3`, Leaflet `1.9.4`, Capacitor `8.5.2` |
| Instalação limpa | Não executada nesta rodada; `npm ci` é instrução de preparação, não evidência obtida |

Metadados e códigos de saída estão em [ambiente.json](evidencias/2026-10-27/ambiente.json). Os resultados abaixo foram obtidos nesta consolidação. Os registros de navegador anteriores permanecem no [histórico](historico-validacoes.md).

## Resultados desta rodada

| Verificação | Resultado obtido | Status | Evidência |
|---|---|---|---|
| `npm run check` | Zero erros e zero avisos do Svelte; comando completo encerrou com código 0 | Aprovado | [check.txt](evidencias/2026-10-27/check.txt) |
| `npm test` | 12 testes aprovados, zero falhas, zero cancelados e zero ignorados; código 0 | Aprovado | [testes.txt](evidencias/2026-10-27/testes.txt) |
| `npm run build` | 169 módulos processados e arquivos de produção gerados em `dist/`; código 0 | Aprovado | [build.txt](evidencias/2026-10-27/build.txt) |

Check e build são verificações técnicas; não devem ser somados aos 12 testes como se fossem testes funcionais adicionais. Não foi medido percentual de cobertura, desempenho ou consumo de bateria.

## Resultado por teste automatizado

Os IDs correspondem ao [catálogo](casos-de-teste.md), na ordem dos testes em `tests/regressions.test.mjs`.

| ID | Resultado |
|---|---|
| AUT-01 | Aprovado — IDs e coordenadas dos conjuntos de demonstração |
| AUT-02 | Aprovado — posição demonstrativa da região de Favoritos |
| AUT-03 | Aprovado — normalização e busca em Favoritos |
| AUT-04 | Aprovado — ordenação sem mutação do conjunto original |
| AUT-05 | Aprovado — proximidade padrão e horário ausente |
| AUT-06 | Aprovado — limites de horários e dias fechados |
| AUT-07 | Aprovado — truncamento por palavras inteiras |
| AUT-08 | Aprovado — resolução de rotas e categorias |
| AUT-09 | Aprovado — tratamento de caminhos e consultas |
| AUT-10 | Aprovado — rejeição de destinos externos/ambíguos |
| AUT-11 | Aprovado — identidade e detalhes dos registros |
| AUT-12 | Aprovado — referências de catálogo e independência de visitas |

## Funcional e visual: evidência anterior e reexecução

Os casos CT foram organizados nesta edição. Não houve nova execução completa desses roteiros no navegador durante esta rodada de documentação. Não foram produzidas novas capturas de tela nem executada uma suíte E2E permanente.

| Grupo | Evidência disponível | Situação nesta rodada |
|---|---|---|
| Navegação, Login de prévia e listas | Registros anteriores de abertura de rotas, filtros, retorno, favoritos e Visitados | Não executado novamente; seguir CT-NAV, CT-LOGIN, CT-LISTA, CT-FAV e CT-VIS |
| Menu, mapa e sugestões | Validação anterior de navegação imóvel durante transição, busca por clique/teclado e controles do mapa nas quatro medidas e em 700 × 390 | Não executado novamente; seguir CT-NAV-05 e CT-MAPA |
| Detalhe e cards | Validação anterior de dimensões recolhidas de 124 px, expansão dos dois cards, descrições longas, ausência de rolagem interna em Sobre a unidade e galeria | Não executado novamente; seguir CT-EST e CT-GAL |
| Responsividade | Inspeções anteriores em 390 × 844, 844 × 390, 834 × 1194 e 1194 × 834 | Não executado novamente; seguir CT-RESP |
| Acessibilidade complementar | Interações específicas de foco, teclado e estados foram verificadas em entregas anteriores | Auditoria completa, leitor de tela e nova rodada CT-ACESS não executados |

O histórico contém aprovações visuais do solicitante e descreve cada etapa em sua versão. As capturas e os scripts temporários dessas execuções não estão versionados; os relatos não equivalem a uma suíte de navegador disponível para execução por `npm test`. Textos históricos sobre pins vermelhos, abas indisponíveis e ausência de telas descrevem versões anteriores e não são critérios atuais.

## Pendências e limites

| Item | Status | Motivo |
|---|---|---|
| Nova rodada funcional completa CT | Não executado | Esta entrega consolida a documentação e registra os comandos atuais |
| Instalação do zero e hospedagem de produção | Não executado | Dependências já instaladas; sem implantação de servidor nesta rodada |
| Aplicação Android instalada, testes JUnit e instrumentação | Não executado | Não houve build nativo nem dispositivo; arquivos de exemplo não comprovam fluxos do produto |
| Outros navegadores, dispositivos físicos e leitores de tela | Não executado | Sem execução nesses ambientes nesta rodada |
| INT-01 a INT-07 | Bloqueado para aceite integrado | Autenticação, API, storage, localização nas páginas e detecção de visitas não integrados; regras dependem do Backend/equipe |
| INT-08 e INT-09 | Bloqueado para aceite integrado | Necessários preparação e definição dos ambientes/plataformas de suporte |

Diferenças conhecidas documentadas: busca de Categoria/Visitados não possui a mesma normalização de acentos de Favoritos/mapa; horários usam exemplos locais sem feriados ou períodos noturnos. Não foram alteradas nem declaradas como falhas novas nesta entrega documental. Não houve falha nos comandos executados.

## Encaminhamento

A análise estática, os 12 testes existentes e o build passaram para o código de referência. Isso sustenta a revisão da prévia web e da documentação, sem comprovar homologação completa do produto, integrações ou execução nativa.

Para a próxima alteração, selecionar os IDs afetados no catálogo, registrar nova versão e evidências em um novo relatório e manter este registro como histórico da rodada. Aprovação de conteúdo documental e autorização de envio desta branch ficam separadas das aprovações visuais das funcionalidades anteriores.

O solicitante aprovou a documentação e autorizou seu envio ao remoto em 2026-10-27. Essa aprovação não altera os resultados nem o estado dos cenários pendentes registrados acima.
