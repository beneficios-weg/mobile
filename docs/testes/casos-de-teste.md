# Casos de teste do sistema

## Convenções

Aplicam-se as condições do [plano de testes](../testes-mobile.md). As rotas são relativas a `http://localhost:5174`. Recarregar a rota inicial de cada caso independente para restaurar os dados demonstrativos. Não recarregar no meio dos passos de navegação e estado compartilhado.

Este catálogo contém resultados **esperados**. Resultados obtidos estão no [relatório de execução](relatorio-execucao.md); cobertura anterior está no [histórico](historico-validacoes.md). Os roteiros não representam execução automática.

## Navegação e Login

| ID / prioridade | Pré-condições e passos | Resultado esperado |
|---|---|---|
| CT-NAV-01 / P0 | Abrir diretamente `/`, `/login`, `/categoria/saude-e-bem-estar`, `/favoritos`, `/visitados`, `/estabelecimento/academia-move` e `/componentes-preview`; recarregar cada endereço. | Página correspondente, título coerente e nenhum erro JavaScript. A galeria permanece separada do Início. |
| CT-NAV-02 / P0 | No Início, abrir cada uma das sete categorias e usar Voltar. | Cada botão abre seu `/categoria/:slug`; retorno ao Início. Lazer e Estética e Vestuário exibem estado vazio. |
| CT-NAV-03 / P0 | Abrir `/rota-inexistente`, `/categoria/nao-existe` e `/estabelecimento/nao-existe`; usar o acesso ao Início. Conferir também `/visitados/` e `/categoria/saude-e-bem-estar/?teste=1`. | Desconhecidos exibem Página não encontrada; o acesso ao Início funciona. Barra final e consulta não invalidam rotas conhecidas. |
| CT-NAV-04 / P0 | Em Categorias, buscar `Academia`, aplicar Maior Desconto, expandir e rolar a lista; abrir um card; voltar pelo botão e pelo histórico; usar Avançar. | Registro correto nos detalhes; busca, filtro, expansão e rolagem restaurados no retorno, sem recarregar o documento. |
| CT-NAV-05 / P1 | Nos quatro viewports, comparar a barra de Categorias com Início, Favoritos, Visitados, detalhe e mapa. Alternar abas e abrir/fechar o mapa, observando o início, meio e fim da animação. | Mesma posição, tamanho, fonte, ícones e estilos no mesmo viewport. O contêiner não se desloca; a seleção e os rótulos internos animam. A aba ativa corresponde ao destino. |
| CT-LOGIN-01 / P1 | Em `/login`, enviar os campos vazios; depois informar e-mail `invalido` e uma senha fictícia. | Validação nativa impede envio; permanece no Login, sem simular erro de credenciais de uma API. |
| CT-LOGIN-02 / P0 | A partir do link Entrar do Início, informar `teste@example.com` e senha fictícia; enviar; voltar ao Login. | Aviso de prévia visível; envio abre o Início; campos locais reiniciados ao retornar. Não há sessão autenticada real. |

## Listas, filtros, favoritos e Visitados

| ID / prioridade | Pré-condições e passos | Resultado esperado |
|---|---|---|
| CT-LISTA-01 / P0 | Em Saúde e Bem-Estar e Visitados, buscar `Academia`, depois `Ótica`; limpar o campo. | Respectivamente dois e um registros nos exemplos atuais; contador e pins acompanham a busca; limpar restaura os oito exemplos. |
| CT-LISTA-02 / P1 | Em Favoritos, buscar `  OTICA  `, `VILA NOVA` e `20% off`, reiniciando o campo entre consultas. | Dois resultados em cada consulta no conjunto inicial; normalização de acento, caixa e espaços; lista, contador e pins coerentes. |
| CT-LISTA-03 / P1 | Nas listas, abrir o filtro, selecionar Maior Desconto e concluir; repetir com ordem alfabética crescente e decrescente, limpando entre as ordens; combinar desconto e proximidade; limpar. | Critérios aplicados ao concluir/fechar, ordem coerente e origem preservada. Ordens alfabéticas opostas não ficam selecionadas juntas; prioridade da combinação segue a seleção. |
| CT-LISTA-04 / P1 | Anotar dia/hora local; ativar Em Horário de Funcionamento em Saúde e Bem-Estar ou Favoritos; comparar com os horários dos exemplos. | Apenas registros elegíveis no dia e intervalo demonstrativos; horário ausente não implica aberto. Os limites exatos são cobertos por AUT-06. |
| CT-LISTA-05 / P1 | Buscar `inexistente` em Categoria, Favoritos e Visitados; limpar. | Estado vazio contextual, contador zero e ausência de pins de estabelecimentos; limpar restaura os resultados. |
| CT-LISTA-06 / P1 | Nos quatro viewports, expandir e recolher Categoria, Favoritos e Visitados pelos controles da página. Em Favoritos, testar também Escape. | Lista ocupa a área prevista sem rota nova; títulos, divisórias, fontes e navegação mantêm o padrão; retorno funciona. Escape e devolução do foco são verificados especificamente em Favoritos. |
| CT-LISTA-07 / P1 | Nas listas e no detalhe, rolar do topo ao meio e ao final; repetir na lista expandida. | Sombras refletem conteúdo acima/abaixo; sombra inferior no limite previsto da área de resultados; sem barra de rolagem visual. Conteúdo final acessível e navegação preservada. |
| CT-FAV-01 / P0 | Em Saúde e Bem-Estar, favoritar uma unidade; abrir seus detalhes; abrir Favoritos e remover a mesma unidade; retornar ao detalhe pela navegação. | Mesmo ID compartilhado entre páginas; favorito e lista atualizados na sessão, sem duplicação de unidades com o mesmo nome. |
| CT-FAV-02 / P1 | Em Favoritos, remover os oito exemplos iniciais; conferir lista/contador/mapa; recarregar. | Estado sem favoritos e contador zero após remoção; reload restaura os oito exemplos, conforme o funcionamento em memória. |
| CT-VIS-01 / P0 | Em Visitados, anotar quantidade; favoritar/desfavoritar um card, abrir detalhe e retornar. | Título/subtítulo de Visitados, Histórico ativo e composição compartilhada com Categorias. As ações não criam nem removem visitas; oito registros demonstrativos permanecem. |

## Informações do estabelecimento e componentes

| ID / prioridade | Pré-condições e passos | Resultado esperado |
|---|---|---|
| CT-EST-01 / P0 | Abrir unidades distintas por Categoria e Favoritos; comparar nome, bairro e coordenadas com o catálogo. Abrir `/estabelecimento/bem-viver`. | Cada detalhe corresponde ao ID selecionado. Informações ausentes são indicadas; não são substituídas pelos dados da unidade Move. |
| CT-EST-02 / P1 | Em `/estabelecimento/academia-move`, conferir o endereço do link Contato. Em `/estabelecimento/bem-viver`, conferir a área de contato. | Move possui link `tel:` correspondente ao exemplo; registro sem contato não gera link telefônico vazio. O teste web não comprova uma chamada telefônica. |
| CT-EST-03 / P1 | No detalhe, acionar Como chegar e conferir a URL de destino aberta. | Provedor externo recebe latitude/longitude da unidade selecionada; a página de origem permanece acessível. Não comprova sucesso de rota ou disponibilidade do provedor. |
| CT-EST-04 / P2 | Conferir Ver fachada em uma unidade sem foto; na galeria, abrir o exemplo que fornece imagem e fechar seu diálogo. | Sem imagem, ação desabilitada. No exemplo com imagem, diálogo abre e fecha sem perder a navegação. |
| CT-EST-05 / P1 | No benefício de Move, reduzir a largura até truncar uma descrição; expandir/recolher por clique e teclado; repetir com cliques consecutivos. | Reticências após palavras inteiras; texto completo disponível e visível durante a animação; público permanece abaixo da divisória; descrições que cabem não exibem expansão desnecessária. |
| CT-EST-06 / P1 | Nos quatro viewports, medir Sobre a unidade e Serviços antes do clique em Move e em Bem Viver; expandir e recolher cada um. | Mesma largura na grade e altura recolhida de 124 px, independentemente do texto. Apenas linhas completas da prévia ficam visíveis; recolher restaura as mesmas dimensões. |
| CT-EST-07 / P1 | Expandir Sobre a unidade e ler o texto até o fim; conferir Serviços; recolher por clique e Escape. Para descrição muito longa, usar dados de teste controlados, sem editar os exemplos de produção. | Sobre a unidade expande lateralmente e cresce verticalmente quando necessário, sem rolagem interna. Serviços preserva o modo de expansão na área disponível. Irmão oculto fica inativo; recolher restaura os dois. |
| CT-GAL-01 / P2 | Abrir `/componentes-preview`, testar os exemplos expansíveis e usar Voltar. | Componentes disponíveis na galeria, sem substituir o Início; altura recolhida compartilhada dos cards preservada; retorno ao Início. |

## Mapa em tela cheia

Iniciar em Visitados, salvo indicação diferente. Abrir o mapa pela aba Mapa. Os resultados desta visualização são recebidos da origem; a busca não consulta toda uma API ou catálogo remoto.

| ID / prioridade | Pré-condições e passos | Resultado esperado |
|---|---|---|
| CT-MAPA-01 / P0 | Abrir Mapa a partir de Início, Categoria, Favoritos, Visitados e detalhe; conferir URL, foco, fundo e controles; tentar clicar/focar a busca da página atrás. | Mesmo URL, diálogo modal e mapa ocupando todo o fundo; busca, retorno, controles e navegação conforme referência aprovada. Conteúdo atrás inativo para clique/teclado. |
| CT-MAPA-02 / P1 | Aplicar busca/filtro na origem, abrir Mapa e selecionar um pin; acionar Ver estabelecimento no popup. | Pins pertencem aos resultados recebidos; seleção coerente e detalhe do registro correto. Tiles nas cores originais, pins azuis e crédito discreto do OpenStreetMap. |
| CT-MAPA-03 / P0 | No mapa de Visitados, buscar `Academia`, depois `OTICA`, depois `inexistente`; limpar pelo campo ou Todos os benefícios. | Respectivamente dois, um e zero resultados. Sugestões junto da barra, contagem e pins representam o mesmo conjunto; estado vazio apropriado; limpar restaura o contexto recebido. |
| CT-MAPA-04 / P1 | Buscar `Academia`; navegar nas sugestões com setas e selecionar com Enter; repetir por clique. Reabrir sugestões e pressionar Escape; depois pressionar Escape novamente. | Seleção centraliza o pin e abre seu popup. Combobox anuncia expansão/seleção. Primeiro Escape fecha sugestões; sem sugestões abertas, Escape fecha o mapa. |
| CT-MAPA-05 / P1 | Aumentar/diminuir zoom, arrastar, centralizar e acionar Todos os benefícios; repetir perto dos limites de zoom. | Controles funcionais e desabilitados nos limites; centralização usa localização fornecida ou centro inicial, sem pedir GPS. Todos os benefícios limpa a busca e enquadra os resultados da origem. |
| CT-MAPA-06 / P1 | No mapa expandido, alterar zoom/centro e buscar um nome; voltar pelo navegador e avançar; fechar pelo botão; reabrir. | Avançar restaura a entrada do mapa com busca e viewport; ao fechar, a origem mantém centro/zoom. Uma nova abertura recebe o contexto atual da origem. |
| CT-MAPA-07 / P0 | Abrir detalhe pelo popup do mapa e usar Voltar no detalhe. | Retorno à página de origem sem reabrir uma entrada intermediária de mapa já encerrada. Filtros originais preservados. |

## Responsividade e acessibilidade complementar

| ID / prioridade | Pré-condições e passos | Resultado esperado |
|---|---|---|
| CT-RESP-01 / P1 | Conferir Início, Categoria, Favoritos, Visitados, detalhe e mapa em CEL-P, CEL-D, TAB-P e TAB-D. | Sem transbordamento horizontal ou elementos essenciais fora da área visível; lista/detalhe roláveis; mapa preenche o contêiner; navegação padronizada. Fontes e ícones mantêm as dimensões aprovadas em cada composição. |
| CT-RESP-02 / P1 | Alterar orientação sem recarregar com lista ou card aberto; repetir com mapa e sugestões. | Estado coerente após reflow; expansão e texto acessíveis; painel de sugestões cabe na altura disponível e não cobre a navegação. |
| CT-ACESS-01 / P1 | Percorrer botões e campos com Tab/Shift+Tab; usar Enter/Espaço em favorito e expansões; testar foco do modal e retorno. | Ações operáveis por teclado, foco visível, rótulos compreensíveis e estados de favorito/expansão anunciados; irmãos ocultos inativos. Registrar separadamente qualquer auditoria com leitor de tela. |
| CT-ACESS-02 / P2 | Ativar preferência de movimento reduzido; alternar abas e expandir cards. | Conteúdo e navegação utilizáveis com animações reduzidas conforme CSS, sem dependência do movimento para entender o resultado. |

## Massa adicional para descrição longa

Para a etapa longa de CT-EST-07, recarregar Move, manter os cards recolhidos e executar somente no console da sessão de teste:

```js
const description = document.querySelector(
  '.establishment-page__supplementary .expandable-about-unit-card__description'
)
if (description) description.textContent = (description.textContent ?? '').repeat(6)
```

Expandir Sobre a unidade, percorrer a descrição completa e recolher. A alteração é somente no DOM da sessão; recarregar restaura a massa original. Não editar os arquivos do catálogo para executar esse caso. Nos quatro tamanhos, conferir aumento de altura quando necessário, texto completo sem rolagem interna e retorno à altura recolhida de 124 px.

## Regressão automatizada existente

Todos os casos AUT são executados por `npm test` em [regressions.test.mjs](../../tests/regressions.test.mjs). Não são testes E2E das telas.

| ID | Nome do teste no código | Verificação |
|---|---|---|
| AUT-01 | `preview map datasets have unique IDs and coordinates inside the map bounds` | IDs e coordenadas de fixtures de Favoritos e benefícios de demonstração |
| AUT-02 | `favorites preview location belongs to the same map region as its pins` | Localização demonstrativa próxima aos exemplos |
| AUT-03 | `favorite search normalizes accents, capitalization and outer whitespace` | Acentos, caixa, espaços, bairro, desconto e busca vazia de resultados |
| AUT-04 | `sorting honors criteria and does not mutate the original dataset` | Ordenação, desempate e preservação dos dados |
| AUT-05 | `default order is nearest and missing operating hours do not imply open` | Ordem padrão e ausência de horários |
| AUT-06 | `open-now includes opening time and excludes closing time and closed weekdays` | Limites de abertura, fechamento e dia fechado |
| AUT-07 | `benefit summaries preserve whole words and leave fitting text unchanged` | Truncamento por palavras inteiras |
| AUT-08 | `fixed routes and category links resolve to their intended destinations` | Rotas fixas e links de categorias |
| AUT-09 | `route parsing handles trailing slashes and queries without falling back to home` | Barras finais, consulta, codificação e caminhos desconhecidos |
| AUT-10 | `internal navigation rejects external and ambiguous targets` | Restrição de navegação a caminhos internos |
| AUT-11 | `each navigable fixture has a unique identity and its own correct details` | IDs únicos, detalhes por registro e compatibilidade de `academia-move` |
| AUT-12 | `home and visited cards reference the catalog and favorites do not define visits` | Referências de catálogo e independência dos exemplos de visita |

## Rastreabilidade funcional

| Área | Casos principais | Automação relacionada, sem substituir a UI |
|---|---|---|
| Rotas e retorno | CT-NAV-01 a CT-NAV-04 | AUT-08 a AUT-11 |
| Navegação visual | CT-NAV-05, CT-RESP-01 | Sem suíte de UI permanente |
| Login de prévia | CT-LOGIN-01 e CT-LOGIN-02 | Sem teste automatizado dedicado |
| Busca e filtros | CT-LISTA-01 a CT-LISTA-05 | AUT-03 a AUT-06 |
| Listas, sombras e expansão | CT-LISTA-06 e CT-LISTA-07 | Sem suíte de UI permanente |
| Favoritos e Visitados | CT-FAV-01, CT-FAV-02, CT-VIS-01 | AUT-11 e AUT-12 |
| Detalhes e cards | CT-EST-01 a CT-EST-07, CT-GAL-01 | AUT-07 e AUT-11 |
| Mapa e sugestões | CT-MAPA-01 a CT-MAPA-07 | AUT-01 e AUT-02 cobrem somente dados |
| Responsividade e acessibilidade | CT-RESP-01, CT-RESP-02, CT-ACESS-01, CT-ACESS-02 | Análise Svelte é parcial; não substitui teste de acessibilidade |

## Integrações e plataformas pendentes

Estes cenários estão **bloqueados para aceite integrado** na versão atual. Detalhar dados, passos e resultados somente após definição dos contratos e ambientes; não criar endpoints ou parâmetros por suposição.

| ID | Cenário futuro | Dependência e critério a confirmar |
|---|---|---|
| INT-01 | Login real, credenciais rejeitadas, sessão expirada, primeiro acesso e recuperação | Contrato e ambiente de autenticação; respostas, renovação e proteção de sessão |
| INT-02 | Leitura remota, pesquisa, filtros e paginação | API e massa controlada; loading, vazio, cancelamento e tratamento de erros contratados |
| INT-03 | Favoritos persistidos e sincronizados | Autoridade, endpoint, conflitos, idempotência e eventual operação offline |
| INT-04 | Permissão/localização real, negada ou indisponível | Integração das páginas e testes em dispositivo; alternativa utilizável sem localização |
| INT-05 | Visitas reais, GPS inconsistente e candidatos sobrepostos | Algoritmo, parâmetros, aceitação/deduplicação e retenção de dados aprovados |
| INT-06 | Offline com/sem cache, timeout, 4xx/5xx e sincronização | Storage, política de cache/fila/retry e contrato do Backend |
| INT-07 | Logout, troca de usuário e isolamento dos dados | Sessão e armazenamento reais; política de limpeza e retenção |
| INT-08 | App Android instalado e retorno físico | Build/dispositivo configurados, teste instrumentado útil, permissões e ciclo de vida |
| INT-09 | Safari/iOS, Firefox, leitor de tela e teclado virtual real | Ambientes disponíveis e matriz de suporte definida; emulação Chrome não comprova compatibilidade |

Ver [Integração com a API](../integracao-api.md), [Geolocalização](../geolocalizacao.md), [Offline](../offline-sync.md), [Visitas](../deteccao-visitas.md) e [Decisões abertas](../decisoes-abertas.md).
