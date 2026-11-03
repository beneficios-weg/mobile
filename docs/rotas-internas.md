# Como chegar dentro do aplicativo

## Fluxo implementado

Ao clicar em **Como chegar** no detalhe do estabelecimento, a aplicação calcula e mostra o trajeto recomendado em azul e as alternativas em cinza no **minimapa da própria página**, sem abrir o diálogo. Clicar no cinza seleciona aquela opção, sem abrir a tela cheia ou consultar novamente o serviço. Clicar no azul, no fundo do mapa, no pin ou pressionar Enter com o mapa focado abre a tela cheia por `openMap`, na mesma URL. A aba Mapa também reutiliza o plano quando ele já existe. A composição usa MapDialog, Map, BackButton, FloatingTabBar, PrimaryButton e os tokens existentes; não altera a tela inicial nem exige redirecionamento ao Google Maps.

O plano calculado (`DirectionsPlan`: origem, opções, seleção e modo) é fornecido ao menu de tela cheia. Abrir, fechar e reabrir não repete a consulta; escolhas e recálculos feitos no menu atualizam a linha do minimapa. Erros do cálculo inicial aparecem na página, com o botão Como chegar disponível para tentar novamente; uma consulta em andamento é cancelada ao sair do detalhe.

Por solicitação do usuário durante a revisão, a partida usa temporariamente uma **localização fictícia em Joinville**, definida em `lib/directionsLocation.ts` como latitude `-26.292` e longitude `-48.864`. Esse ponto demonstrativo permite comparar dois trajetos reais de carro até Move; o estabelecimento permanece no destino original. O mapa identifica a origem como fictícia e não solicita GPS por padrão.

`DirectionsPanel.svelte` oferece **Carro, A pé e Bicicleta**, com os perfis apropriados. Cada opção de trajeto mostra tempo, distância e vias principais. A alternativa selecionada aparece em azul; as demais, em cinza. Iniciar rota oculta os seletores e apresenta um painel compacto com orientação principal, tempo, distância e Encerrar rota; o mapa aplica zoom 17 na partida do usuário, preservando o caminho escolhido. Encerrar restaura o planejamento e as opções já calculadas. A lista e a ação Ver etapas foram removidas a pedido do solicitante.

O card do destino fica dentro do menu de rotas, com nome e endereço alinhados à esquerda e sem a seção Sua localização. Permanece visível depois de iniciar o trajeto. A lista reserva exatamente a altura da primeira opção, um espaçamento de 8 px e ¼ da segunda; com uma única opção, usa somente a altura dela. É possível rolar a lista para comparar as demais, com a barra visual oculta. Iniciar rota e Recalcular ficam lado a lado, usando o mesmo PrimaryButton, tamanho, borda, raio e tipografia; a variante secondary diferencia somente as cores. Encerrar rota também usa PrimaryButton. A ação Ver rota completa usa um ícone de mapa, em vez das setas de expansão.

As alternativas também podem ser selecionadas no mapa em tela cheia. O enquadramento inicial inclui todos os trajetos; o traçado selecionado tem prioridade sobre os trechos compartilhados. Eventos de clique na alternativa não propagam para a ação de abrir o mapa. Como chegar mantém o estado visual normal após a liberação do clique, inclusive com o ponteiro sobre ele; o foco de ponteiro é removido sem suprimir os estilos de foco por teclado dos componentes.

Ver rota completa aplica um pulso de 280 ms somente no ícone e uma transição de 700 ms no mapa até o enquadramento geral. O botão e a navegação permanecem fixos. Cliques repetidos reiniciam o feedback do ícone; a preferência por movimento reduzido usa enquadramento imediato e não anima o ícone. O enquadramento automático e a seleção de alternativas mantêm o comportamento anterior, sem essa animação de clique.

O clique/toque não deixa halo de foco no botão; o indicador permanece disponível pelo teclado. O mapa publica o enquadramento ao terminar o movimento, elimina notificações duplicadas e reconhece o retorno desse mesmo estado sem executar outro comando de câmera. Diferenças menores que um pixel não provocam reposicionamento. O espaço reservado ao painel só dispara novo enquadramento quando suas medidas mudam.

Os painéis se adaptam aos quatro tamanhos já usados pelo projeto. O enquadramento reserva espaço para controles, menu e navegação. Escolher uma alternativa, iniciar/encerrar, mover o mapa, selecionar um pin ou mudar o zoom não inicia novas requisições. Alterar o modo e Recalcular consultam o serviço. No modo comum, a busca e o layout do mapa continuam disponíveis sem solicitar localização.

## Serviços e responsabilidade

- `directionsLocation.ts`: define a partida de demonstração e a opção de reativar GPS com `VITE_DIRECTIONS_REAL_LOCATION=true` (exige reiniciar o Vite). Sem essa opção explícita, nenhuma API de localização é chamada. O modo real permanece preparado em `geolocationService.ts`, com consulta pontual e tratamento de permissão/erro.
- `routingService.ts`: carro usa `VITE_OSRM_URL` ou `https://router.project-osrm.org`; caminhada usa `VITE_OSRM_WALKING_URL` ou `https://routing.openstreetmap.de/routed-foot`; bicicleta usa `VITE_OSRM_CYCLING_URL` ou `https://routing.openstreetmap.de/routed-bike`. Cada modo usa seu servidor, sem apenas trocar o nome do perfil no endpoint de carro. Envia origem/destino com `steps=true`, `overview=full`, `geometries=geojson` e `alternatives=3`. A consulta tem limite de 20 segundos e aceita cancelamento; consultas ao serviço público FOSSGIS são espaçadas por pelo menos 1,1 segundo.
- `lib/directions.ts`: valida a resposta, converte GeoJSON para a ordem do Leaflet, prepara as etapas e formata metros/quilômetros e minutos/horas.
- `Map.svelte`: apresenta a geometria recebida e a posição, sem chamar GPS ou calcular trajetos. A camada de rota é atualizada separadamente dos pins para preservar zoom e movimento manuais.

O formato segue a [documentação oficial da API do OSRM](https://project-osrm.org/docs/v5.24.0/api/) e os modos dedicados seguem a [configuração do frontend OSRM](https://github.com/Project-OSRM/osrm-frontend). Os serviços públicos são demonstrativos e sua disponibilidade não é garantida. O uso de caminhada/bicicleta respeita o espaçamento da [política FOSSGIS](https://routing.openstreetmap.de/about.html) e exibe a atribuição OSM e o link Corrigir mapa. A equipe deve configurar serviços apropriados antes de homologar produção; não foram introduzidos endpoints do Backend do produto nem dependências novas.

O número de alternativas depende da malha e do perfil. Se o serviço retornar somente uma rota válida, a interface informa uma opção disponível; não fabrica nem duplica trajetos. Alternativas inválidas ou com geometria idêntica são descartadas.

## Estados e retorno

No modo padrão de demonstração, o cálculo começa da posição fictícia do usuário, sem pedir GPS. Quando o modo real é explicitamente habilitado, aparece Obtendo sua localização, com a explicação da finalidade; depois, Calculando a rota. Localização negada, indisponível ou expirada no modo real, resposta inválida, ausência de caminho, falha de rede e timeout produzem mensagem e Tentar novamente. Não é desenhada uma linha reta como se fosse uma rota válida. As coordenadas dos estabelecimentos permanecem intactas nos dois modos.

Voltar, Escape, Voltar do navegador ou mudar de aba encerram a expansão. Requisições HTTP são canceladas ao fechar ou recalcular; resultados tardios do GPS são ignorados. Avançar no histórico restaura o plano guardado naquela entrada, quando disponível; obter uma nova origem é parte da ação explícita de recalcular. O restante da página fica inativo enquanto o diálogo está aberto.

## Limites da funcionalidade

A duração é estimada **sem trânsito em tempo real**. Iniciar aproxima a partida e mostra a orientação inicial do trajeto selecionado; nesta prévia com usuário fictício, não há movimento simulado, rastreamento contínuo, navegação por voz ou atualização automática por deslocamento. Transporte público não está implementado. Recalcular é uma ação explícita.

Origem e destino são enviados ao serviço de roteamento para atender à ação solicitada. No padrão atual, a origem é fictícia, não a posição real do usuário. A posição e a geometria permanecem no estado transitório do diálogo e são descartadas ao desmontá-lo; não são gravados trajetos em storage, logs ou histórico de visitas. O histórico interno já existente pode manter o centro/zoom do mapa em memória até recarregar a aplicação. As consultas não criam visitas nem alteram favoritos.

Os estabelecimentos ainda usam dados demonstrativos. A origem real e a integração web foram exercitadas com GPS simulado; permissão em aparelho, build Android e ciclo de vida nativo exigem validação separada. O navegador precisa oferecer geolocalização em contexto seguro (HTTPS ou localhost).

Ver [relatório de testes de rotas](testes/relatorio-rotas-internas.md).
