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

As classes visuais do mapa ficam em `src/components/styles/map.css`. O endereço OSRM padrão em `routingService.ts` serve apenas ao protótipo; o serviço de rota deve ser configurado fora do componente de mapa.
## Uso na tela de categoria

`CategoryPage` usa `Map.svelte` com `variant="category"`, mantendo o mapa dentro do contêiner e das dimensões responsivas já definidos pela tela. Os tiles vêm do OpenStreetMap; os pins mantêm o tratamento visual da categoria e a seleção sincroniza o pin com o card correspondente. Os nomes e coordenadas exibidos continuam sendo dados locais demonstrativos, ainda sem integração com a API de estabelecimentos.
