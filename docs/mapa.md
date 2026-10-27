# Componente de mapa de benefícios

## Responsabilidade

`src/components/Map.svelte` cuida somente da apresentação e interação do mapa Leaflet: tiles, limites e zoom, pins de benefícios, indicador de localização e desenho de uma rota fornecida pela tela. Ele não solicita localização, consulta serviços externos, lê armazenamento local, escolhe os benefícios nem calcula distâncias ou rotas.

A tela que usa o mapa fornece esses dados por propriedades:

- `benefits`: benefícios a exibir;
- `userLocation`: posição atual opcional;
- `routeCoordinates`: pontos `[latitude, longitude]` de uma rota opcional;
- `onBenefitSelect`: callback opcional ao selecionar um pin;
- `onBenefitOpen`: callback opcional da ação Ver estabelecimento no popup;
- `center` e `initialZoom`: visualização recebida da tela;
- `onViewportChange`: informa centro e zoom depois do movimento para manter o contexto da origem.

As integrações ficam nos serviços `src/services/geolocationService.ts` e `src/services/routingService.ts`. Os dados fictícios do protótipo ficam em `src/services/benefitsService.ts`.

## Como usar

```svelte
<script lang="ts">
  import Map from './components/Map.svelte'
  import { demoBenefits } from './services/benefitsService'
</script>

<Map benefits={demoBenefits} />
```

A tela pode passar `userLocation` e `routeCoordinates` depois de obtê-los pelas camadas apropriadas. Ao clicar em um pin, `onBenefitSelect` recebe o benefício correspondente; o componente não busca uma rota nem altera o estado de favoritos.

## Comportamento visual

O mapa usa Leaflet e tiles do OpenStreetMap, mantém o viewport dentro de limites aproximados do Brasil, não repete tiles horizontalmente e exibe os pins recebidos. Quando `userLocation` é fornecida, exibe o marcador correspondente; quando `routeCoordinates` é fornecida, desenha a geometria e enquadra rota e origem no viewport.

Os tiles são exibidos nas cores originais do OpenStreetMap, sem filtros de cor ou camadas de escurecimento sobre o mapa, inclusive na variante usada em Categoria e Favoritos.

Conforme a referência `image.png`, o mapa compacto não exibe botões de zoom nem a legenda Benefício/Você. O prefixo visual do Leaflet também foi retirado; permanece somente a atribuição discreta do OpenStreetMap no rodapé do mapa. Zoom por gesto, roda do mouse e teclado, seleção dos pins e popups continuam disponíveis. A expansão tem os controles próprios descritos abaixo.

As classes visuais do mapa ficam em `src/components/styles/map.css`. O endereço OSRM padrão em `routingService.ts` serve apenas ao protótipo; o serviço de rota deve ser configurado fora do componente de mapa.
## Uso na tela de categoria

`CategoryPage` e `FavoritesPage` usam `Map.svelte` com `variant="default"`, dentro do layout compartilhado de `DirectoryPage.css`. Os tiles mantêm as cores originais e os pins usam o mesmo padrão azul. A seleção sincroniza pin e card; os dados continuam demonstrativos.

`FavoritesPage` fornece os favoritos filtrados e pode receber `userLocation`. Os marcadores são atualizados por identificador, preservando foco e popups nas mudanças de seleção; selecionar um estabelecimento fora da área visível centraliza o mapa nele. A lista e o mapa compartilham seleção, busca e remoção. A posição de demonstração fica na mesma região dos oito exemplos, que possuem IDs únicos.

`MainPage` também usa `variant="default"`, com o mapa real e os mesmos controles, tiles e pins de Categoria/Favoritos. Todas as categorias abrem suas listas. `EstablishmentInfoPage` usa `variant="category"` com tiles habilitados. A variante controla a apresentação do contêiner e dos controles; os pins compartilham o mesmo estilo azul.

## Expansão e navegação

`MapDialog.svelte` monta `Map` depois de abrir um diálogo nativo modal, para inicializar o Leaflet com dimensões visíveis. Recebe resultados filtrados, seleção, centro e zoom da página atual. Movimento e zoom atualizam a visualização guardada em memória pela origem; fechar e reabrir não reinicia o enquadramento.

A composição segue `Screen/Mobile/Portrait/Map.svg`, do arquivo `Benefícios Corporativos — Protótipo (Copy) (Copy).zip`: mapa preenchendo todo o fundo, Search no topo, BackButton abaixo à esquerda, controles circulares à direita e FloatingTabBar na parte inferior com Mapa ativo. Em 390 × 844, a busca ocupa `(16, 16, 358, 52)`, o retorno `(18, 84, 44, 44)`, Todos os benefícios `(85, 696, 220, 48)` e a navegação `(20, 760, 350, 64)`. As posições se adaptam ao viewport e às áreas seguras, mantendo os componentes nos quatro tamanhos de referência. O fundo usa o Leaflet atual com tiles originais e pins azuis.

A busca adicional do mapa ignora acentos e filtra nome/local dentro dos resultados recebidos, sem alterar os filtros da página de origem. Os controles aumentam/diminuem o zoom e centralizam na localização fornecida ou no centro inicial quando ela não existe; não solicitam GPS. Todos os benefícios limpa essa busca e enquadra os resultados da visualização. `Map` expõe `changeZoom`, `recenter` e `fitBenefits` para essas ações. As abas inferiores mantêm a navegação existente.

Ao digitar, os mesmos resultados dos pins aparecem em um painel junto da busca, com nome, local e contagem. Clique ou setas/Enter selecionam o resultado, centralizam o pin e abrem seu popup; `Map.focusBenefit` realiza essa ação. Escape fecha primeiro as sugestões, e o próximo Escape pode fechar o mapa. O painel possui altura limitada e rolagem própria para caber na orientação deitada. `Search` recebe atributos opcionais de combobox somente nesse uso.

A FloatingTabBar segue a posição, largura, fonte e animação compartilhadas de Categorias, inclusive no mapa em tela cheia. Os estilos de posicionamento ficam em `floating-tab-bar.css`, evitando deslocamento do contêiner entre páginas ou ao abrir/fechar a expansão.

Não há rota exclusiva para o mapa expandido. A History API permite fechar por Voltar e restaurar por Avançar. Escape também fecha, e o diálogo torna o restante da página inativo para ponteiro e teclado. A ação do popup abre os detalhes do registro selecionado e permite retornar à origem. Ver [Navegação](navegacao.md).
