# Telas e fluxos

Os elementos descritos combinam requisitos funcionais com interfaces já implementadas. As páginas atuais usam dados demonstrativos; API, autenticação e persistência continuam pendentes. Não interpretar detalhes desta página como substitutos do contrato do Backend ou do design vigente.

## Fluxo principal

```text
Login → Início → Mapa → Categoria → Estabelecimentos → Detalhes → Benefício
```

Favoritos e Lojas visitadas são destinos adicionais. Mapa em tela cheia expande o contexto atual, sem rota própria. Primeiro acesso e recuperação de senha são requisitos futuros. Os caminhos e comportamentos já conectados estão em [Navegação implementada](navegacao.md).

## 01 — Login

Na implementação atual, Entrar abre o Início como prévia, sem autenticação real, por confirmação do solicitante. Mantém a validação nativa de e-mail e campos obrigatórios; limpa os valores ao enviar, sem armazenar credenciais ou chamar API. O acesso parte do link Entrar no Início ou de `/login`, e o botão Voltar permite retornar.

A futura autenticação depende das regras e payloads do Backend. Primeiro acesso, recuperação de senha e estados de envio, credenciais rejeitadas e falhas de rede continuam pendentes dessa integração. Não há regra confirmada de autenticação offline.

## 02 — Landing / Início

A rota `/` renderiza `src/pages/MainPage.svelte`, com logo, mapa Leaflet com tiles OpenStreetMap, categorias e navegação flutuante. Reutiliza `Map`, `CategoryButton`, `FloatingTabBar` e `ScrollShadow`, usando o layout compartilhado de `DirectoryPage.css` e os tamanhos padrão dos componentes. Em pé, mapa e categorias ficam empilhados; deitado, mapa/navegação ficam à esquerda e as categorias à direita, com rolagem quando necessário. A galeria permanece em `/componentes-preview`.

As sete categorias abrem `/categoria/:slug`; Favoritos abre `/favoritos`; Histórico abre `/visitados`. A aba Mapa expande o mapa atual em um diálogo modal; Início abre `/`. Dados e localização continuam demonstrativos, sem API ou coleta de GPS.

Ponto de entrada após autenticação. Combina mapa de estabelecimentos próximos e navegação por categorias. Deve comunicar permissão de localização negada, ausência de resultados, conteúdo em cache e falha da API sem bloquear toda a navegação quando houver dados locais úteis.

## 03 — Categoria

Apresenta estabelecimentos associados à categoria escolhida, com contexto de mapa e lista. Reutiliza busca, FilterDropdown, contador, cards, sombras e expansão existentes. Cards abrem os detalhes do estabelecimento selecionado; pins permitem seleção e acesso ao detalhe pelo popup. Categorias sem exemplos exibem o estado vazio. O retorno dos detalhes preserva busca, filtros aplicados, expansão e rolagem em memória. O filtro não altera os dados de origem.

## 04 — Loja / Estabelecimento

A página de apresentação `src/pages/EstablishmentInfoPage.svelte` está disponível em `/estabelecimento/:id`; `/estabelecimento/academia-move` mantém compatibilidade com o exemplo anterior. Usa as quatro referências locais: celular em pé (390 × 844), celular deitado (844 × 390), tablet em pé (834 × 1194) e tablet deitado (1194 × 834). Em pé, o mapa fica acima dos detalhes; deitado, permanece na coluna esquerda com a navegação, enquanto a coluna direita rola até o fim da página. As sombras indicam conteúdo fora da área visível, sem barra de rolagem visual.

Reutiliza `BackButton`, `FavoriteButton`, `Map`, `FloatingTabBar`, `EstablishmentFacadeCard`, `PrimaryButton`, `BenefitCard`, `AboutUnitCard`, `ExpandableAboutUnitCard` e `ScrollShadow`, preservando os estilos atuais desses componentes. Sobre a unidade mantém a expansão lateral e aumenta a altura conforme necessário para mostrar toda a descrição sem rolagem interna; Serviços mantém a expansão em área existente. Escape recolhe o card aberto. O mapa mantém os tiles originais do OpenStreetMap e pins azuis.

O catálogo de `src/pages/catalog.ts` fornece os dados demonstrativos correspondentes ao registro selecionado e reutiliza `establishment.ts` para a unidade Move. Favoritar atualiza a prévia compartilhada com as listas; não há persistência. O contato abre a ligação quando informado; campos ausentes mostram indisponibilidade, sem link telefônico vazio. Como chegar abre um provedor externo de direções com o destino selecionado. A foto da fachada não foi fornecida: o botão segue desabilitado pelo componente existente até receber `facadeImageUrl`. A navegação abre Início, Favoritos e Visitados ou expande o mapa local. O retorno usa a origem registrada no histórico da aplicação, com alternativa para a categoria correspondente.

Exibe os detalhes fornecidos pelo Backend e destaca um benefício principal no MVP. A tela deve permitir favoritar/desfavoritar sem inferir uma visita. Informações como endereço, horário e ação de rota só podem ser mostradas se fizerem parte do design e dos dados disponíveis.

## 05 — Favoritos

Lista estabelecimentos marcados pelo usuário e pode apresentar contexto de mapa conforme o design. Favoritar é uma ação explícita e independente de visita. A autoridade, o endpoint e a política de sincronização dos favoritos são **DECISÃO PENDENTE** até confirmação do Backend.

A implementação de UI está em `src/pages/FavoritesPage.svelte`, na rota `/favoritos`, sem substituir a tela inicial. A prévia usa dados fictícios e favoritos compartilhados em memória: permite buscar por nome, bairro ou desconto, ordenar por proximidade, nome ou desconto, selecionar um estabelecimento no mapa, abrir seus detalhes, remover favoritos e expandir/recolher a lista. Recarregar a página restaura os exemplos; isso não representa persistência ou sincronização. O mapa usa Leaflet e tiles externos do OpenStreetMap, com localização demonstrativa opcional e sem solicitar GPS. As quatro abas estão conectadas.

O layout segue as quatro referências fornecidas, com o padrão compartilhado de pins azuis e tipografia de sistema idêntica à página de categorias. Ver detalhes em [Componentes de UI](componentes-ui.md).

## 06 — Mapa em tela cheia

`MapDialog.svelte` expande o mapa em um diálogo nativo modal, sem rota própria, mantendo resultados filtrados, seleção, centro e zoom. Voltar, Escape e o histórico do navegador controlam a expansão. O conteúdo atrás fica inativo para clique e teclado. O mapa não implica rastreamento permanente. Estados de permissão e localização real dependem da futura integração.

## 07 — Lojas visitadas

A interface está disponível em `/visitados`, com título “Visitados” e subtítulo “Estabelecimentos visitados”. `VisitedPage.svelte` reutiliza a composição de `CategoryPage.svelte` por `variant="visited"`: mapa, busca, filtro, contador, cards, sombras, navegação e expansão são os mesmos de Categorias. A aba Histórico começa ativa. Não há CSS específico de Visitados.

Os oito estabelecimentos são exemplos locais reaproveitados da prévia de Categorias para validar o layout; não são visitas reais nem eventos produzidos por geolocalização. Não são criados endpoints, datas de visita, persistência ou regras de detecção. Favoritar um card não o remove do histórico. O retorno usa a origem registrada, com alternativa para Início; as abas Início/Favoritos abrem suas rotas, e Mapa expande o mapa da página. Cards e popups abrem os detalhes correspondentes.

Apresenta visitas reconhecidas e sincronizadas, com os campos que o Backend definir. Não confundir candidatos locais ainda pendentes com visitas confirmadas. A tela deve distinguir ausência de histórico, falha de atualização e conteúdo em cache.

## Fluxos auxiliares

### Primeiro acesso

Fluxo futuro previsto a partir de Login. Interface, etapas, validações, payloads e códigos de erro dependem do Backend e são **DECISÃO PENDENTE**.

### Recuperação de senha

Fluxo futuro previsto a partir de Login. Interface, identidade solicitada, confirmação e comportamento de deep link ou código dependem do Backend e são **DECISÃO PENDENTE**.

### Favoritar

Parte de cards ou detalhes da loja. A UI atualiza o estado de modo claro; eventual atualização otimista e rollback só devem ser implementados após a definição do contrato e da estratégia offline.

### Detecção de visita

Coleta temporariamente sinais de localização, avalia proximidade e consistência e gera um evento candidato. O tratamento no servidor está descrito apenas quando o contrato for publicado. Veja [Detecção de visitas](deteccao-visitas.md).

## Floating Tab Bar

O componente existente mantém ícones, animação e ordem: Início, Mapa, Favoritos e Histórico. As abas abrem `/`, o mapa expandido da origem, `/favoritos` e `/visitados`, respectivamente. A navegação conectada reutiliza o visual aprovado nas quatro versões responsivas.

## Regras comuns de estado

Toda tela que consome dados remotos deve prever:

- **loading:** indicador sem apagar cache útil;
- **vazio:** mensagem contextual e ação possível;
- **erro:** mensagem compreensível e tentativa novamente;
- **offline com cache:** conteúdo identificado como possivelmente desatualizado;
- **offline sem cache:** orientação sem simular sucesso;
- **permissão negada:** alternativa funcional quando a localização não for essencial.
