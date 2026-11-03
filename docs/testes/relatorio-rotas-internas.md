# Validação de Como chegar no mapa interno

## Versão e ambiente

- Data: 2026-11-03, fuso America/Sao_Paulo.
- Branch: `feat/in-app-directions`, iniciada em `87963bc`. Feature aprovada visualmente pelo solicitante em 2026-11-03, com autorização para envio e merge em `develop`.
- Ambiente: Windows, Node Test Runner, Svelte/TypeScript e Chrome isolado sem interface; mesma aplicação local na porta 5174.
- Massa: unidade Move em Joinville e posição fictícia próxima, fornecida pela emulação de geolocalização do navegador. Nenhuma localização pessoal foi usada.

## Comandos

Atualização mais recente da revisão: 21 testes automatizados aprovados. Foram acrescentados dois cenários para alternativas distintas/deduplicação e servidores próprios de caminhada/bicicleta. Os resultados de 19 testes abaixo registram a etapa inicial da mesma funcionalidade.

`npm test`: 19 testes aprovados, incluindo os 12 existentes e sete casos novos de parser, instruções, métricas, requisição, falhas, cancelamento e timeout. Os testes HTTP usam fetch simulado e não comprovam a disponibilidade do OSRM.

`npm run check`: zero erros e zero avisos de Svelte/TypeScript. O build de produção foi gerado na validação final desta branch.

## Revisão de meios de transporte, alternativas e início

Revisão de foco e estabilidade do zoom: Chrome isolado em 390×844, 844×390, 834×1194 e 1194×834. Clique físico em Ver rota completa sem foco persistente/contorno e com destaque nativo de toque transparente; foco por teclado continuou visível e foi preservado após Enter. Nos quatro tamanhos, a câmera permaneceu estável durante a amostragem após zoom 4, zoom 18, deslocamento animado e posicionamento nos limites do mapa. Verificados antes/depois de iniciar e após zoom pelos controles; nenhum comando de câmera de retorno do estado foi observado. Resposta de rotas interceptada com massa real anterior; zero erros JavaScript. Check sem erros/avisos, 21 testes aprovados e build concluído. Aprovação visual em aparelho permanece pendente.

Revisão da animação de Ver rota completa: nos quatro viewports, foram amostrados quadros durante o clique. O ícone apresentou pulso e o mapa mudou de enquadramento progressivamente; retângulos do botão e da navegação permaneceram idênticos entre os quadros, sem nova requisição de rota. Cliques repetidos terminaram no enquadramento geral e não deixaram animações penduradas. A preferência por movimento reduzido desativou o pulso e a transição do mapa. Zero erros JavaScript; check sem erros/avisos e build concluído.

Revisão de interação no traçado: nas quatro medidas, cliques físicos em segmentos cinza do minimapa selecionaram a alternativa sem consulta nova ou abertura do diálogo; a seleção foi confirmada ao abrir o menu. A mesma interação passou no mapa expandido. A resposta real do OSRM foi reutilizada por interceptação para estabilizar o teste. O estado visual de Como chegar após mouseup/hover retornou a `#00579d`, sem estado ativo ou foco de ponteiro persistente. Nome/endereço alinhados à esquerda e ausência da seção Sua localização foram conferidos antes/depois de iniciar. Encerrar rota foi verificado como PrimaryButton com raio de 18 px e peso 600; o ícone de visão geral é um mapa. Capturas inspecionadas, sem erros JavaScript.

Revisão posterior de fluxo/menu: Como chegar passou a desenhar a rota primeiro no minimapa. Nas quatro medidas, foram verificados ausência de abertura automática do diálogo, cálculo único, toque real no minimapa para expandir, plano reutilizado sem consulta extra, card de origem/destino dentro do menu, recorte exato de ¼ da segunda opção, botões de ação com propriedades e dimensões iguais (exceto cores), início/encerramento sem mover a navegação e manutenção do modo ao fechar/reabrir. Erro/nova tentativa na página e Enter para expandir também passaram. Zero erros JavaScript; capturas foram inspecionadas. Esta revisão substitui as menções iniciais de abertura automática da tela cheia e header separado.

A nova partida fictícia (`-26.292`, `-48.864`) mantém Move como destino original e retornou duas alternativas reais em cada um dos três modos consultados. As respostas foram usadas em interceptação para os testes repetíveis; chamadas adicionais reais no navegador confirmaram Carro, A pé e Bicicleta.

Nos quatro tamanhos, foram conferidos seleção do modo, duas alternativas, destaque da selecionada, início com zoom 17, estabilidade do zoom após o painel mudar de tamanho, redução da altura do painel, Encerrar restaurando opções sem nova consulta, ausência de Ver etapas e de barras de rolagem visíveis, navegação sem mudar posição e zero solicitações de GPS. No celular deitado, a composição foi compactada para exibir alternativas e Iniciar rota simultaneamente.

Conferidos também: resposta com somente uma opção sem duplicação, erro HTTP/nova tentativa, troca rápida entre modos com cancelamento da resposta obsoleta e retorno à página. Zero erros JavaScript observados; capturas foram inspecionadas. Arquivos de automação/capturas foram temporários. Aprovação visual pendente.

## Navegador — validação inicial antes da revisão de layout

CT-ROTA foi exercitado com uma resposta real do OSRM capturada usando somente coordenadas demonstrativas e reutilizada por interceptação para estabilizar os cenários. Foram conferidas a origem enviada e as coordenadas do destino selecionado. Uma consulta adicional real, sem interceptação da resposta, foi concluída diretamente do navegador.

A resposta real retornou 43 pontos, cinco etapas, 866,1 metros e 91,8 segundos; a UI apresentou 866 m e 2 min. Esses números descrevem a massa e o momento da consulta, não um valor permanente esperado para o produto.

| Verificação | Resultado |
|---|---|
| 390 × 844, 844 × 390, 834 × 1194 e 1194 × 834 | Mapa preenchendo o viewport, painéis visíveis e navegação mantendo posição/tamanho do detalhe |
| Ação Como chegar | Mesma URL, diálogo interno e nenhuma janela externa |
| Rota e etapas | Traçado azul nas vias, origem e destino identificáveis, métricas e etapas em português |
| Seleção de etapa, zoom e reenquadramento | Não repetiram o cálculo; mapa respondeu às ações |
| Estado normal do mapa | Busca e composição anteriores preservadas; sem chamada de rota ou GPS pelo simples acesso à aba |
| GPS negado | Mensagem e retorno disponíveis; nenhuma consulta de rota usando origem fictícia |
| HTTP 503 e NoRoute | Mensagem de erro e nova tentativa; sem geometria substituta inventada |
| Nova tentativa válida | Cálculo concluído após recuperação do serviço/permissão |
| Fechamento durante cálculo | Consulta cancelada e resultado tardio sem reabrir/alterar a página |
| Fechamento durante GPS | Callback tardio ignorado; nenhuma nova consulta de rota |
| Voltar/Avançar e Escape | Diálogo encerrado/restaurado conforme histórico; origem recalculada ao restaurar |
| Erros JavaScript | Zero observados |

Capturas dos quatro layouts, resumo/etapas e estados de erro foram inspecionadas. Os roteiros e capturas de automação foram temporários; não há suíte de navegador permanente adicionada ao projeto. Os testes automatizados novos ficam em `tests/regressions.test.mjs`.

## Limites

Atualização solicitada durante a revisão: a origem do usuário passou a ser fictícia por padrão, em Joinville; o destino continua usando o cadastro original do estabelecimento. Uma nova verificação com permissão de GPS negada e um contador de chamadas confirmou zero solicitações de geolocalização, rótulo de partida fictícia, consulta OSRM usando a origem de demonstração e destino Move original, sem erros JavaScript. Check e build passaram após a mudança. Os testes de permissão descritos acima se referem ao modo real preparado, que pode ser habilitado com `VITE_DIRECTIONS_REAL_LOCATION=true`.

Localização indisponível/expirada possui tratamento de erro, mas o fluxo visual foi exercitado especificamente com permissão negada. Geometrias inválidas e timeout foram verificados pelos testes automatizados. Não houve teste em aparelho Android, build nativo, navegação por voz, acompanhamento contínuo ou medição de trânsito. A disponibilidade futura do servidor demonstrativo não é garantida.

Os cenários iniciais desta validação não integram autenticação, API do produto, persistência ou detecção de visitas. A aprovação visual da feature e a autorização para merge foram recebidas em 2026-11-03; homologação Android permanece separada.
