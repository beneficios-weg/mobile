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
| `BenefitBadge` | Destaque curto do benefício principal |
| `FavoriteButton` | Alternância acessível do favorito (implementado em `src/components/atoms/FavoriteButton.svelte`) |
| `SortControl` | Escolha de ordenação disponível |
| `FilterControl` | Entrada para filtros confirmados pelo produto |
| `StoreList` | Lista, estados vazio/loading/erro e paginação, se contratada |
| `BenefitCard` | Conteúdo detalhado do benefício |
| `PrimaryButton` | Ação primária consistente |
| `FloatingTabBar` | Navegação entre destinos principais |

## Implementados e uso atual

O código contém os componentes abaixo. Os itens da tabela anterior continuam representando componentes planejados, a menos que estejam listados aqui.

| Componente implementado | Arquivo | Uso atual |
|---|---|---|
| `BackButton` | `src/components/atoms/BackButton.svelte` | Categoria e prévia de componentes |
| `Input` | `src/components/atoms/Input.svelte` | Login e prévia de componentes |
| `Search` | `src/components/atoms/Search.svelte` | Categoria e prévia de componentes |
| `PrimaryButton` | `src/components/atoms/PrimaryButton.svelte` | Login e prévia de componentes |
| `FavoriteButton` | `src/components/atoms/FavoriteButton.svelte` | Categoria e prévia de componentes |
| `CategoryButton` | `src/components/atoms/CategoryButton.svelte` | Prévia de componentes |
| `FloatingTabBar` | `src/components/atoms/FloatingTabBar.svelte` | Categoria e prévia de componentes |
| `Title` | `src/components/atoms/Title.svelte` | Prévia de componentes |
| `ResultsCount` | `src/components/atoms/ResultsCount.svelte` | Categoria e prévia de componentes |
| `ScrollShadow` | `src/components/atoms/ScrollShadow.svelte` | Categoria |
| `FilterButton` | `src/components/atoms/FilterButton.svelte` | Usado por `FilterDropdown` |
| `BenefitLocationCard` | `src/components/atoms/BenefitLocationCard.svelte` | Prévia de componentes |
| `FilterDropdown` | `src/components/molecules/FilterDropdown.svelte` | Categoria; ordena os resultados e pode restringir a estabelecimentos em horário de funcionamento |
| `EstablishmentCard` | `src/components/molecules/EstablishmentCard.svelte` | Categoria |
| `Map` | `src/components/Map.svelte` | Categoria e prévia de componentes |

## Páginas e telas no código

- `/` ainda apresenta uma galeria de componentes em `src/App.svelte`; não é a tela de Início do produto.
- `/categoria/saude-e-bem-estar` renderiza `CategoryPage`. A ordenação, os cards e o mapa Leaflet usam componentes reutilizáveis. O mapa exibe tiles reais do OpenStreetMap e sincroniza a seleção entre pins e cards; os estabelecimentos e suas coordenadas ainda são dados locais demonstrativos, sem conexão com a API do produto.
- `src/screens/Login.svelte` implementa a tela de Login com `Input` e `PrimaryButton`, mas ainda não está conectada a uma rota em `src/App.svelte`.
- `FilterDropdown` salva as opções durante a edição e aplica os critérios quando o painel fecha. Crescente e decrescente não podem ficar ativos juntos; as demais opções podem ser combinadas. Quando há mais de uma ordenação, a prioridade segue a ordem de seleção. O horário de funcionamento atua como filtro adicional; os horários da tela atual são demonstrativos.

## Diretrizes visuais

- mobile-first;
- tipografia Inter;
- Lucide Icons;
- mapa como elemento central;
- componentes reutilizáveis, pequenos e acessíveis;
- benefício principal claramente destacado;
- estados de interação, foco, indisponibilidade e carregamento visíveis.

As cores exatas, espaçamentos, sombras e tamanhos não estão versionados; devem vir do Figma validado e ser convertidos em tokens compartilhados.

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
