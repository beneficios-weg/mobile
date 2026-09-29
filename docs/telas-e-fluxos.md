# Telas e fluxos

Os elementos descritos são requisitos funcionais; os protótipos não estão versionados e a implementação ainda não existe. Não interpretar detalhes desta página como substitutos do contrato do Backend ou do design vigente.

## Fluxo principal

```text
Login → Início → Mapa → Categoria → Estabelecimentos → Detalhes → Benefício
```

Mapa em tela cheia, Favoritos e Lojas visitadas são destinos adicionais. Primeiro acesso e recuperação de senha partem de Login.

## 01 — Login

Autentica o colaborador conforme regras e payloads do Backend. Deve oferecer acesso aos fluxos de primeiro acesso e recuperação de senha. Estados mínimos: envio em andamento, credenciais rejeitadas, indisponibilidade de rede e falha inesperada. Não há regra confirmada de autenticação offline.

## 02 — Landing / Início

Ponto de entrada após autenticação. Combina mapa de estabelecimentos próximos e navegação por categorias. Deve comunicar permissão de localização negada, ausência de resultados, conteúdo em cache e falha da API sem bloquear toda a navegação quando houver dados locais úteis.

## 03 — Categoria

Apresenta estabelecimentos associados à categoria escolhida, com contexto de mapa e lista. Pesquisa e ordenação são requisitos documentados na referência anterior, mas os controles exatos dependem do protótipo vigente. O filtro nunca deve alterar os dados de origem.

## 04 — Loja / Estabelecimento

Exibe os detalhes fornecidos pelo Backend e destaca um benefício principal no MVP. A tela deve permitir favoritar/desfavoritar sem inferir uma visita. Informações como endereço, horário e ação de rota só podem ser mostradas se fizerem parte do design e dos dados disponíveis.

## 05 — Favoritos

Lista estabelecimentos marcados pelo usuário e pode apresentar contexto de mapa conforme o design. Favoritar é uma ação explícita e independente de visita. A autoridade, o endpoint e a política de sincronização dos favoritos são **DECISÃO PENDENTE** até confirmação do Backend.

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
