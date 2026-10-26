# Componente de mapa de benefícios

## Responsabilidade

`src/components/Map.svelte` cuida somente da apresentação e interação do mapa Leaflet: tiles, limites e zoom, pins de benefícios, indicador de localização e desenho de uma rota fornecida pela tela. Ele não solicita localização, consulta serviços externos, lê armazenamento local, escolhe os benefícios nem calcula distâncias ou rotas.

A tela que usa o mapa fornece esses dados por propriedades:

- `benefits`: benefícios a exibir;
- `userLocation`: posição atual opcional;
- `routeCoordinates`: pontos `[latitude, longitude]` de uma rota opcional;
- `onBenefitSelect`: callback opcional ao selecionar um pin.

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

As classes visuais do mapa ficam em `src/components/styles/map.css`. O endereço OSRM padrão em `routingService.ts` serve apenas ao protótipo; o serviço de rota deve ser configurado fora do componente de mapa.
## Uso na tela de categoria

`CategoryPage` e `FavoritesPage` usam `Map.svelte` com `variant="default"`, dentro do layout compartilhado de `DirectoryPage.css`. Os tiles mantêm as cores originais e os pins usam o mesmo padrão azul. A seleção sincroniza pin e card; os dados continuam demonstrativos.

`FavoritesPage` fornece os favoritos filtrados e pode receber `userLocation`. Os marcadores são atualizados por identificador, preservando foco e popups nas mudanças de seleção; selecionar um estabelecimento fora da área visível centraliza o mapa nele. A lista e o mapa compartilham seleção, busca e remoção. A posição de demonstração fica na mesma região dos oito exemplos, que possuem IDs únicos.

`MainPage` também usa `variant="default"`, com o mapa real e os mesmos controles, tiles e pins de Categoria/Favoritos. As categorias sem rota própria filtram localmente os exemplos do mapa; Saúde e Bem-Estar abre a página de categoria existente. `EstablishmentInfoPage` usa `variant="category"` com tiles habilitados. A variante controla a apresentação do contêiner e dos controles; os pins compartilham o mesmo estilo azul.
