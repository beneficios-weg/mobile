# Telas e fluxos

Os elementos descritos combinam requisitos funcionais com interfaces já implementadas. As páginas atuais usam dados demonstrativos; API, autenticação e persistência continuam pendentes. Não interpretar detalhes desta página como substitutos do contrato do Backend ou do design vigente.

## Fluxo principal

```text
Login → Início → Mapa → Categoria → Estabelecimentos → Detalhes → Benefício
```

Mapa em tela cheia, Favoritos e Lojas visitadas são destinos adicionais. Primeiro acesso e recuperação de senha partem de Login.

## 01 — Login

Autentica o colaborador conforme regras e payloads do Backend. Deve oferecer acesso aos fluxos de primeiro acesso e recuperação de senha. Estados mínimos: envio em andamento, credenciais rejeitadas, indisponibilidade de rede e falha inesperada. Não há regra confirmada de autenticação offline.

## 02 — Landing / Início

A rota `/` renderiza `src/pages/MainPage.svelte`, com logo, mapa Leaflet com tiles OpenStreetMap, categorias e navegação flutuante. Reutiliza `Map`, `CategoryButton`, `FloatingTabBar` e `ScrollShadow`, usando o layout compartilhado de `DirectoryPage.css` e os tamanhos padrão dos componentes. Em pé, mapa e categorias ficam empilhados; deitado, mapa/navegação ficam à esquerda e as categorias à direita, com rolagem quando necessário. A galeria permanece em `/componentes-preview`.

Saúde e Bem-Estar abre `/categoria/saude-e-bem-estar`; Favoritos abre `/favoritos`. A aba Mapa foca o mapa atual e Início restaura todos os exemplos. Categorias sem rota implementada filtram os pins locais, com mensagem quando não há resultados; selecionar novamente remove o filtro. Histórico informa sua indisponibilidade. Dados e localização continuam demonstrativos, sem API ou coleta de GPS.

Ponto de entrada após autenticação. Combina mapa de estabelecimentos próximos e navegação por categorias. Deve comunicar permissão de localização negada, ausência de resultados, conteúdo em cache e falha da API sem bloquear toda a navegação quando houver dados locais úteis.

## 03 — Categoria

Apresenta estabelecimentos associados à categoria escolhida, com contexto de mapa e lista. Pesquisa e ordenação são requisitos documentados na referência anterior, mas os controles exatos dependem do protótipo vigente. O filtro nunca deve alterar os dados de origem.

## 04 — Loja / Estabelecimento

A página de apresentação `src/pages/EstablishmentInfoPage.svelte` está disponível em `/estabelecimento/academia-move`, sem alterar a galeria inicial. Usa as quatro referências locais: celular em pé (390 × 844), celular deitado (844 × 390), tablet em pé (834 × 1194) e tablet deitado (1194 × 834). Em pé, o mapa fica acima dos detalhes; deitado, permanece na coluna esquerda com a navegação, enquanto a coluna direita rola até o fim da página. As sombras indicam conteúdo fora da área visível, sem barra de rolagem visual.

Reutiliza `BackButton`, `FavoriteButton`, `Map`, `FloatingTabBar`, `EstablishmentFacadeCard`, `PrimaryButton`, `BenefitCard`, `AboutUnitCard`, `ExpandableAboutUnitCard` e `ScrollShadow`, preservando os estilos atuais desses componentes. Sobre a unidade mantém a expansão lateral e aumenta a altura conforme necessário para mostrar toda a descrição sem rolagem interna; Serviços mantém a expansão em área existente. Escape recolhe o card aberto. O mapa mantém os tiles originais do OpenStreetMap e pins azuis.

Os dados de `src/pages/establishment.ts` são demonstrativos e não representam payload da API. Favoritar altera o estado da prévia, com callback disponível para integração; não há persistência. O contato abre a ligação e Como chegar abre um provedor externo de direções com o destino selecionado. A foto da fachada não foi fornecida: o botão segue desabilitado pelo componente existente até receber `facadeImageUrl`. A navegação abre Início/Favoritos, foca o mapa local ou informa que Histórico ainda não está disponível. O retorno usa a página de origem da mesma aplicação, quando disponível, com alternativa para Categorias.

Exibe os detalhes fornecidos pelo Backend e destaca um benefício principal no MVP. A tela deve permitir favoritar/desfavoritar sem inferir uma visita. Informações como endereço, horário e ação de rota só podem ser mostradas se fizerem parte do design e dos dados disponíveis.

## 05 — Favoritos

Lista estabelecimentos marcados pelo usuário e pode apresentar contexto de mapa conforme o design. Favoritar é uma ação explícita e independente de visita. A autoridade, o endpoint e a política de sincronização dos favoritos são **DECISÃO PENDENTE** até confirmação do Backend.

A implementação de UI está em `src/pages/FavoritesPage.svelte`, na rota `/favoritos`, sem substituir a tela inicial. A prévia usa dados fictícios mantidos em memória na rota: permite buscar por nome, bairro ou desconto, ordenar por proximidade, nome ou desconto, selecionar um estabelecimento no mapa ou na lista, remover favoritos e expandir/recolher a lista. Recarregar a página restaura os exemplos; isso não representa persistência ou sincronização. O mapa usa Leaflet e tiles externos do OpenStreetMap, com localização demonstrativa opcional e sem solicitar GPS. A navegação para telas ainda não implementadas não integra esta entrega.

O layout segue as quatro referências fornecidas, com o padrão compartilhado de pins azuis e tipografia de sistema idêntica à página de categorias. Ver detalhes em [Componentes de UI](componentes-ui.md).

## 06 — Mapa em tela cheia

Expande o mapa mantendo o contexto da tela de origem, seus filtros e a seleção atual. Deve tratar falta de permissão, posição indisponível e ausência de estabelecimentos. O mapa não implica rastreamento permanente.

## 07 — Lojas visitadas

Apresenta visitas reconhecidas e sincronizadas, com os campos que o Backend definir. Não confundir candidatos locais ainda pendentes com visitas confirmadas. A tela deve distinguir ausência de histórico, falha de atualização e conteúdo em cache.

## Fluxos auxiliares

### Primeiro acesso

Disponível a partir de Login. Etapas, validações, payloads e códigos de erro dependem do Backend e são **DECISÃO PENDENTE**.

### Recuperação de senha

Disponível a partir de Login. Identidade solicitada, confirmação e comportamento de deep link ou código dependem do Backend e são **DECISÃO PENDENTE**.

### Favoritar

Parte de cards ou detalhes da loja. A UI atualiza o estado de modo claro; eventual atualização otimista e rollback só devem ser implementados após a definição do contrato e da estratégia offline.

### Detecção de visita

Coleta temporariamente sinais de localização, avalia proximidade e consistência e gera um evento candidato. O tratamento no servidor está descrito apenas quando o contrato for publicado. Veja [Detecção de visitas](deteccao-visitas.md).

## Floating Tab Bar

Componente de navegação principal previsto para o aplicativo. A quantidade, os rótulos, a ordem e o comportamento de cada aba devem seguir o protótipo vigente. Como ele não está versionado, esses detalhes permanecem **DECISÃO PENDENTE**.

## Regras comuns de estado

Toda tela que consome dados remotos deve prever:

- **loading:** indicador sem apagar cache útil;
- **vazio:** mensagem contextual e ação possível;
- **erro:** mensagem compreensível e tentativa novamente;
- **offline com cache:** conteúdo identificado como possivelmente desatualizado;
- **offline sem cache:** orientação sem simular sucesso;
- **permissão negada:** alternativa funcional quando a localização não for essencial.
