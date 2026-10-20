# Componente de mapa de benefícios

## O que foi criado

- `src/components/Map.svelte`: mostra o mapa Leaflet, os dois benefícios de demonstração, a localização atual e a rota selecionada.
- `src/services/geolocationService.ts`: pede permissão e lê a localização com `@capacitor/geolocation` no Android; no navegador usa a API de geolocalização do próprio navegador.
- `src/services/routingService.ts`: consulta o OSRM para obter uma rota de carro e converte as coordenadas para o formato usado pelo Leaflet.
- `src/services/benefitsService.ts`: contém os dois benefícios fictícios do protótipo.

As dependências `leaflet`, `@types/leaflet` e `@capacitor/geolocation` foram adicionadas ao projeto. As permissões de internet e localização aproximada e precisa estão declaradas em `android/app/src/main/AndroidManifest.xml`.

## Como funciona

1. Ao montar, o componente cria o mapa, carrega os tiles do OpenStreetMap e posiciona os marcadores dos benefícios.
2. O botão **Usar minha localização** solicita a permissão do Android e busca as coordenadas do dispositivo.
3. Ao escolher um benefício, o componente consulta o OSRM usando origem e destino. O OSRM recebe os pontos como `longitude,latitude` e devolve a geometria GeoJSON.
4. A geometria é convertida para `[latitude, longitude]`, desenhada como uma linha Leaflet e enquadrada junto com o marcador do usuário.
5. A requisição anterior é cancelada se o usuário escolher outro benefício.

## Como usar o componente

```svelte
<script lang="ts">
  import Map from './components/Map.svelte'
</script>

<Map />
```

O app deve ser servido em contexto seguro para a geolocalização funcionar. Em Android, sincronize o plugin depois da instalação:

```sh
npx cap sync android
```

## Como personalizar a camada visual do Leaflet

As opções iniciais ficam no `onMount` de `Map.svelte`:

- **Mapa base:** altere a URL de `L.tileLayer(...)` e a atribuição correspondente. Confira os termos do provedor antes de usar tiles em produção.
- **Marcadores:** personalize `L.divIcon(...)` em `addBenefitMarkers()` e as classes `.benefit-marker` / `.benefit-marker-wrapper` no CSS.
- **Localização do usuário:** personalize `L.circleMarker(...)` em `requestLocation()`.
- **Rota:** altere `color`, `weight`, `opacity`, `lineCap` e `lineJoin` em `L.polyline(...)`; a classe `.benefit-route` também pode receber CSS.
- **Controles e zoom:** altere as opções de `L.map(...)` e a posição de `L.control.zoom(...)`.
- **Aparência da tela:** ajuste as variáveis `--map-accent`, `--map-route`, `--map-surface`, `--map-border`, `--map-text` e `--map-muted` no seletor `.benefits-map`.

Os benefícios de exemplo usam coordenadas fictícias na região de Jaraguá do Sul. Substitua `demoBenefits` pela chamada ao endpoint real quando ele estiver disponível. O endereço OSRM público configurado por padrão é para demonstração e não oferece garantia de disponibilidade; em produção, configure um serviço próprio com `VITE_OSRM_URL`.
