# Componentes de UI

Este inventário reúne componentes implementados e planejados. Os contratos e o visual devem acompanhar os protótipos vigentes; componentes implementados usam seus nomes reais no código.

| Componente planejado | Responsabilidade |
|---|---|
| `AppHeader` | Título, retorno e ações contextuais |
| `MapView` | Contêiner do provedor de mapas e viewport |
| `MapPin` | Marcador de estabelecimento e estado selecionado |
| `SearchBar` | Entrada de pesquisa e limpeza |
| `CategoryButton` | Seleção acessível de categoria com ícone, tom visual e estado selecionado |
| `CategoryGrid` | Organização responsiva de categorias |
| `EstablishmentCard` | Resumo do estabelecimento, distância e benefício disponível |
| `EstablishmentFacadeCard` | Exibe nome, endereço, horário, contato e abre a imagem da fachada recebida pela interface |
| `AboutUnitCard` | Exibe o título h3 e a descrição completa da unidade em largura total |
| `ExpandableAboutUnitCard` | Expande a descrição verticalmente sobre o espaço reservado dos irmãos ocultos, sem alterar o layout da página |
| `BenefitBadge` | Destaque curto do benefício principal |
| `FavoriteButton` | Alternância acessível do favorito (implementado em `src/components/atoms/FavoriteButton.svelte`) |
| `SortControl` | Escolha de ordenação disponível |
| `FilterControl` | Entrada para filtros confirmados pelo produto |
| `StoreList` | Lista, estados vazio/loading/erro e paginação, se contratada |
| `BenefitCard` | Conteúdo detalhado do benefício |
| `PrimaryButton` | Ação primária consistente |
| `ExpandButton` | Alterna a visualização entre os estados compacto e expandido |
| `FloatingTabBar` | Navegação entre destinos principais |

## Implementados e uso atual

O código contém os componentes abaixo. Os itens da tabela anterior continuam representando componentes planejados, a menos que estejam listados aqui.

| Componente implementado | Arquivo | Uso atual |
|---|---|---|
| `BackButton` | `src/components/atoms/BackButton.svelte` | Categoria e prévia de componentes |
| `ExpandButton` | `src/components/atoms/ExpandButton.svelte` | Categoria, Favoritos e prévia de componentes |
| `Input` | `src/components/atoms/Input.svelte` | Login e prévia de componentes |
| `Search` | `src/components/atoms/Search.svelte` | Categoria e prévia de componentes |
| `PrimaryButton` | `src/components/atoms/PrimaryButton.svelte` | Login e prévia de componentes |
| `FavoriteButton` | `src/components/atoms/FavoriteButton.svelte` | Categoria e prévia de componentes |
| `CategoryButton` | `src/components/atoms/CategoryButton.svelte` | Início e prévia de componentes, com os tamanhos e ícones existentes |
| `FloatingTabBar` | `src/components/atoms/FloatingTabBar.svelte` | Categoria e prévia de componentes |
| `ResultsCount` | `src/components/atoms/ResultsCount.svelte` | Categoria e prévia de componentes |
| `ScrollShadow` | `src/components/atoms/ScrollShadow.svelte` | Início, Categoria, Favoritos e Informações do Estabelecimento |
| `FilterButton` | `src/components/atoms/FilterButton.svelte` | Usado por `FilterDropdown` |
| `BenefitLocationCard` | `src/components/atoms/BenefitLocationCard.svelte` | Prévia de componentes |
| `FilterDropdown` | `src/components/molecules/FilterDropdown.svelte` | Categoria; ordena os resultados e pode restringir a estabelecimentos em horário de funcionamento |
| `EstablishmentCard` | `src/components/molecules/EstablishmentCard.svelte` | Categoria e Favoritos, com variantes que preservam os estilos de cada página |
| `EstablishmentFacadeCard` | `src/components/atoms/EstablishmentFacadeCard.svelte` | Prévia temporária de componentes; recebe campos prontos por props e não acessa a API |
| `AboutUnitCard` | `src/components/atoms/AboutUnitCard.svelte` | Prévia temporária; exibição larga com título h3 |
| `ExpandableAboutUnitCard` | `src/components/atoms/ExpandableAboutUnitCard.svelte` | Prévia temporária; destaque e ocultação dos irmãos preservam as dimensões da grade |
| `BenefitCard` | `src/components/molecules/BenefitCard.svelte` | Card detalhado com uma ou mais linhas de desconto e público, disponível para composição de telas |
| `Map` | `src/components/Map.svelte` | Categoria, Favoritos e prévia de componentes |

### Card de Benefício

`BenefitCard` recebe `discounts` (lista de `{ value, description }`), `audience` e, opcionalmente, `title` e `audienceLabel`. Os estilos ficam em `src/components/styles/benefit-card.css`, com seletores limitados à classe `.benefit-details-card` para não conflitar com `BenefitLocationCard`.

Cada descrição aparece em uma linha, com reticências após a última palavra inteira que cabe na largura disponível. A palavra que ultrapassa o limite fica totalmente oculta, sem cortes no meio. Apenas as linhas truncadas são interativas: clique, Enter ou Espaço alternam a descrição completa abaixo do destaque. A expansão de cada linha é independente, aumenta a altura do card e mantém o público abaixo da divisória verde. A detecção de truncamento acompanha mudanças de largura e conteúdo. O componente usa a fonte de sistema confirmada e recebe somente dados de apresentação, sem integração com API.

### Animação dos cards expansíveis

`BenefitCard` usa `src/lib/benefitDescriptionMotion.ts` para mover um único texto visível da posição ao lado do destaque para baixo dele, em um trajeto curvo contínuo. A posição e a área visível da descrição e a altura ocupada pela linha são animadas juntas por 420 ms. A quebra de linhas é mantida estável durante o movimento, e o texto desce antes de se alinhar à esquerda para não atravessar o título. Ao recolher, retorna à posição original e recupera as reticências após palavras inteiras. Cliques consecutivos retomam a geometria visível, e mudanças de largura recalculam o layout.

`ExpandableAboutUnitCard` usa `src/lib/aboutUnitExpansion.ts`: os vizinhos desaparecem por opacidade em 180 ms, e o card expande lateralmente e em altura num movimento de 420 ms, mantendo o texto visível. O recolhimento dura 320 ms e libera imediatamente o retorno dos vizinhos. O modo padrão `area` mantém a altura reservada do slot e limita a expansão à região `data-about-unit-area`, com rolagem interna se necessário. O modo `content`, usado em Sobre a unidade na página do estabelecimento, preserva a expansão lateral e aumenta a altura da página até caber toda a descrição, sem rolagem interna. Cards ocultos ficam `inert` e fora da leitura assistiva. Recolhido, o texto fica limitado a cinco linhas.

A preferência `prefers-reduced-motion` desativa as animações. Os dois cards expõem `aria-expanded` e `aria-controls`.

## Páginas e telas no código

- `/` renderiza `MainPage`, a interface de Início com dados demonstrativos e o mesmo layout de mapa/navegação de Categoria/Favoritos. A grade usa CategoryButton sem reduções locais de fonte, ícone ou escala; a galeria de componentes fica em `/componentes-preview`.
- `/estabelecimento/academia-move` renderiza `EstablishmentInfoPage`, com os componentes existentes de mapa, fachada, contato, benefícios e cards expansíveis.
- `/categoria/saude-e-bem-estar` renderiza `CategoryPage`. A ordenação, os cards e o mapa Leaflet usam componentes reutilizáveis. O mapa exibe tiles reais do OpenStreetMap e sincroniza a seleção entre pins e cards; os estabelecimentos e suas coordenadas ainda são dados locais demonstrativos, sem conexão com a API do produto.
- `/login` renderiza `src/pages/Login.svelte`, que compõe os átomos `Input` e `PrimaryButton`. Os estilos e as regras responsivas ficam em `src/pages/styles/Login.css`, importado pela própria página; os seletores ficam limitados ao Login para não afetar as demais telas. A autenticação ainda não está integrada ao Backend.
- `FilterDropdown` salva as opções durante a edição e aplica os critérios quando o painel fecha. Crescente e decrescente não podem ficar ativos juntos; as demais opções podem ser combinadas. Quando há mais de uma ordenação, a prioridade segue a ordem de seleção. O horário de funcionamento atua como filtro adicional; os horários da tela atual são demonstrativos.

## Diretrizes visuais

- mobile-first;
- tipografia de sistema, com a mesma configuração da página de categorias;
- Lucide Icons;
- mapa como elemento central;
- componentes reutilizáveis, pequenos e acessíveis;
- benefício principal claramente destacado;
- estados de interação, foco, indisponibilidade e carregamento visíveis.

As cores exatas, espaçamentos, sombras e tamanhos não estão versionados; devem vir do Figma validado e ser convertidos em tokens compartilhados.

### Tipografia confirmada

Em 2026-10-21, o solicitante confirmou que Favoritos deve usar a mesma configuração da página de Categorias, atualmente centralizada em `src/pages/styles/DirectoryPage.css`:

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif;
```

Essa pilha usa a fonte disponível no sistema; não implica instalar ou distribuir SF Pro. A indicação anterior de Inter como fonte obrigatória foi substituída por esta decisão. Não adicionar fontes externas nem alterar a tipografia dos componentes compartilhados para atender uma única página: aplicar o padrão na composição da página. Se faltar informação no protótipo ou no padrão existente, confirmar antes de escolher.

### Reutilização sem alteração de layout

`ExpandButton` mantém a apresentação original da prévia na variante padrão `map`. As variantes `category-list` e `favorites-list` preservam as classes, os ícones e os atributos de acessibilidade dos botões de expansão que já existiam nas respectivas páginas. Favoritos mantém também a referência ao botão para devolver o foco ao recolher a lista.

`EstablishmentCard` usa a variante `category` por padrão; a variante `favorites` preserva as classes `favorites-card`, a formatação do texto, o estado selecionado e a opção de desabilitar a remoção. O layout compartilhado está em `DirectoryPage.css`; as folhas específicas das páginas definem apenas os estados vazios.

### Página de Favoritos

`src/pages/FavoritesPage.svelte` compõe `Map`, `BackButton`, `Search`, `FilterDropdown`, `ResultsCount`, `ExpandButton`, `EstablishmentCard`, `FloatingTabBar` e `ScrollShadow`. `EstablishmentCard` compõe `FavoriteButton`. O layout compartilhado fica em `DirectoryPage.css` e o estado vazio em `FavoritesPage.css`. A tela é acessível diretamente em `/favoritos`.

O mapa usa os tiles reais do OpenStreetMap, nas cores originais, e recebe as coordenadas de `FavoritePlace` (`latitude` e `longitude`). Busca e remoção atualizam a lista, o contador e os pins juntos. Selecionar um pin destaca e traz seu card para a área visível; selecionar um card destaca seu pin e o traz para o mapa quando necessário. Os marcadores existentes são preservados nas mudanças de seleção para manter foco e popups. A localização é opcional e recebida por `userLocation`; a rota fornece uma posição de demonstração, sem solicitar GPS. Os dados de estabelecimentos e coordenadas continuam sendo demonstrativos.

Os quatro layouts são celular em retrato (390 × 844), celular em paisagem (844 × 390), tablet em retrato (834 × 1194) e tablet em paisagem (1194 × 834). Os marcadores usam o padrão azul compartilhado do mapa, conforme a revisão aprovada de Categoria/Favoritos; a localização de demonstração também aparece em azul.

As imagens de paisagem apresentam divergências de conteúdo: o celular usa o título “Estabelecimentos da categoria” e o tablet marca a aba “Início”. O solicitante confirmou manter “Estabelecimentos favoritos” e a aba “Favoritos” ativa nas quatro versões.

A página recebe os favoritos e callbacks por propriedades. Busca, ordenação, seleção e expansão são locais à UI; a remoção é delegada ao callback. Os dados de demonstração de `src/pages/favorites.ts` são fornecidos pela rota e não representam integração com o Backend, cache ou persistência.

Na composição atual de `src/App.svelte`, o retorno e a aba Início navegam para `/`. As abas Mapa e Histórico continuam dependendo de telas de destino ainda não implementadas; a troca para o mapa real de Favoritos não cria essas rotas.

## Contratos dos componentes

Componentes visuais recebem dados já preparados e callbacks; não devem conhecer endpoints, gravar diretamente no storage ou solicitar permissão de localização. `MapView` encapsula o provedor, enquanto regras de permissão e coleta ficam na camada de localização. `FavoriteButton` representa a intenção do usuário, mas não decide sozinho como a mutação será sincronizada.

## Acessibilidade mínima

- rótulo acessível para ícones e pins;
- alvo de toque adequado;
- contraste validado no design;
- feedback que não dependa apenas de cor;
- estado selecionado anunciado;
- ordem de foco coerente;
- textos compatíveis com aumento de fonte sempre que o layout permitir.

## DECISÃO PENDENTE

- tokens definitivos do design;
- conteúdo e ordem da Floating Tab Bar;
- comportamento de clustering e seleção de pins;
- estados exatos previstos nos protótipos;
- nomenclatura real após a implementação.
