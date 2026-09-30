# Componentes de UI

Não existem componentes implementados na branch base. Os nomes abaixo são **nomes planejados** do briefing e devem ser substituídos pelos nomes reais quando o código surgir. O design final é responsabilidade do Frontend e deve seguir os protótipos vigentes.

| Componente planejado | Responsabilidade |
|---|---|
| `AppHeader` | Título, retorno e ações contextuais |
| `MapView` | Contêiner do provedor de mapas e viewport |
| `MapPin` | Marcador de estabelecimento e estado selecionado |
| `SearchBar` | Entrada de pesquisa e limpeza |
| `CategoryCard` | Acesso visual a uma categoria |
| `CategoryGrid` | Organização responsiva de categorias |
| `EstablishmentCard` | Resumo do estabelecimento, distância e benefício disponível |
| `BenefitBadge` | Destaque curto do benefício principal |
| `FavoriteButton` | Alternância acessível do favorito |
| `SortControl` | Escolha de ordenação disponível |
| `FilterControl` | Entrada para filtros confirmados pelo produto |
| `StoreList` | Lista, estados vazio/loading/erro e paginação, se contratada |
| `BenefitCard` | Conteúdo detalhado do benefício |
| `PrimaryButton` | Ação primária consistente |
| `FloatingTabBar` | Navegação entre destinos principais |

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
