# Navegação da prévia web

A navegação conecta as interfaces existentes sem recarregar o documento. `src/lib/routes.ts` resolve os caminhos, `src/lib/navigation.svelte.ts` coordena a History API e `src/App.svelte` monta a página correspondente. Os estilos, componentes e a expansão das listas continuam compartilhados.

## Caminhos

| Caminho | Conteúdo |
|---|---|
| `/` | Início, sete categorias e acesso ao Login |
| `/login` | Formulário de prévia com retorno ao Início |
| `/categoria/:slug` | Lista e mapa da categoria selecionada |
| `/favoritos` | Favoritos compartilhados entre listas e detalhes |
| `/visitados` | Histórico demonstrativo, independente dos favoritos |
| `/estabelecimento/:id` | Detalhes do estabelecimento selecionado |
| `/componentes-preview` | Galeria de componentes separada do Início |

As sete categorias do Início são `clientes-weg`, `educacao`, `idiomas`, `cursos-e-treinamentos`, `saude-e-bem-estar`, `lazer` e `estetica-e-vestuario`. Todas abrem a mesma composição de Categoria; categorias sem exemplos exibem o estado vazio. `alimentacao` atende ao exemplo de café da galeria. O endereço anterior `/estabelecimento/academia-move` permanece como alternativa para o registro `move`.

URLs inexistentes, categorias desconhecidas e IDs ausentes mostram Página não encontrada, com retorno e acesso ao Início. Barras finais são aceitas. O servidor de hospedagem deve encaminhar as rotas da aplicação para `index.html` para permitir acesso direto e atualização do navegador.

## Interações e retorno

- A FloatingTabBar abre Início, Favoritos e Visitados; Mapa expande o mapa da página atual.
- Os cards abrem os detalhes do registro selecionado. Pins selecionam o estabelecimento; a ação Ver estabelecimento no popup abre seus detalhes.
- O botão Voltar e o histórico do navegador preservam busca, filtros aplicados, seleção, expansão e rolagem das listas na sessão da página. A posição e o zoom do mapa também são mantidos em memória.
- Um acesso direto, sem uma origem registrada pela aplicação, usa um destino interno de retorno: Início nas listas e categoria correspondente nos detalhes. Não depende de `document.referrer`.
- A troca de rota move o foco para o título visível, sem deslocar a rolagem.
- A barra usa o padrão responsivo de Categorias em todas as páginas. A troca de aba mantém a posição e as dimensões do contêiner e anima a seleção, inclusive entre rotas e na expansão do mapa.

## Mapa expandido

`MapDialog.svelte` apresenta o mesmo componente Leaflet em um `dialog` nativo modal, preenchendo o viewport. Não cria uma rota: os resultados filtrados, a seleção, o centro e o zoom são recebidos da origem. Zoom e movimento atualizam a origem para manter a visualização ao fechar.

O mapa ocupa todo o fundo, conforme o SVG de referência. Busca, retorno, controles laterais, Todos os benefícios e FloatingTabBar ficam sobrepostos ao mapa. A busca atua nos resultados recebidos; Todos os benefícios limpa essa busca e enquadra o conjunto recebido. A centralização usa a localização fornecida pela origem ou o centro inicial. Não há solicitação de GPS ou alteração dos filtros originais. A busca do mapa também é restaurada ao avançar no histórico.

A busca mostra uma lista de sugestões junto do campo e os mesmos resultados como pins. Selecionar uma sugestão por clique ou setas/Enter centraliza o pin e abre seu popup. Escape fecha as sugestões antes de fechar o mapa. A barra de navegação mantém a mesma geometria da página de Categorias em cada tamanho de viewport.

O mapa só é montado depois de o diálogo abrir, para o Leaflet calcular as dimensões corretamente. O diálogo mantém o restante da página inativo para ponteiro e teclado; a busca atrás dele não recebe cliques. Voltar, Escape e Voltar do navegador fecham a expansão; Avançar pode restaurá-la com a última visualização. O foco retorna ao elemento anterior quando ele ainda existe.

Abrir detalhes pelo popup substitui a entrada de expansão no histórico. Assim, retornar do detalhe leva à página de origem, sem reabrir um mapa intermediário.

## Dados e limites

`src/pages/catalog.ts` reúne somente exemplos de apresentação e mantém IDs distintos para unidades diferentes. Dados ausentes não são copiados da unidade Move: endereço, horário e contato recebem indicação de indisponibilidade, e não há link telefônico vazio. Como chegar mantém a ação externa existente com as coordenadas selecionadas.

`src/lib/siteState.svelte.ts` compartilha favoritos em memória. Recarregar restaura os exemplos; não há persistência, sincronização nem sessão autenticada. A lista de Visitados continua sendo uma prévia: abrir ou favoritar um estabelecimento não cria uma visita.

Por confirmação do solicitante, Entrar no Login abre o Início como prévia, sem autenticação real. A validação nativa dos campos permanece; o envio limpa os valores locais e não envia nem armazena credenciais. Primeiro acesso e recuperação de senha continuam aguardando interface e contrato do Backend.

Não foram adicionadas bibliotecas de roteamento, endpoints, autenticação ou coleta de localização. A validação web não substitui testes em dispositivo Capacitor/Android.
