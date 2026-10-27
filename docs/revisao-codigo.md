# Revisão e limpeza do código — 2026-10-26

Base: `develop` atualizada por fast-forward até `d5fd87d`. Branch de trabalho: `refactor/code-cleanup`.

Registro histórico da revisão. A navegação incompleta e os favoritos isolados descritos abaixo foram tratados depois em `feat/site-navigation`: rotas conectadas, catálogo de apresentação unificado e favoritos compartilhados em memória. Os limites de API, persistência e autenticação permanecem. Veja [Navegação atual](navegacao.md).

## Escopo e evidências

Revisão das páginas e rotas, átomos/moléculas, mapa, animações, serviços, tipos de domínio, estilos, configurações web/Capacitor e configuração/código Android. A documentação foi confrontada com a implementação. O `check` da base retornou 20 erros em cinco arquivos; havia trechos de implementações anteriores misturados ao código integrado, mesmo sem marcadores de conflito.

## Corrigido

| Problema | Impacto | Correção |
|---|---|---|
| Imports duplicados em App/Favoritos, funções e templates antigos de BenefitCard misturados aos atuais | Impedia a compilação e duplicava conteúdo/atributos acessíveis | Mantida uma única implementação, com a animação aprovada de `8b3c23e` |
| Dois blocos de mapa sobrepostos em Favoritos, `sortOrder` removido ainda referenciado | Template inválido e regras conflitantes de filtro/mapa | Uma única composição de mapa, com os filtros atuais e localização opcional |
| Recriação duplicada de marcadores e `categoryStyle` inexistente em Map | Falha de compilação e risco de perder foco/seleção dos pins | Um marcador por ID, atualizado em vez de recriado, com o padrão azul existente |
| CSS anterior de Categoria/Favoritos reintroduzido após a extração para DirectoryPage | Regras concorrentes alteravam tamanhos e posições entre telas | Restauradas as folhas específicas do refactor aprovado `30f4f4d`; layout continua centralizado em DirectoryPage |
| Exemplos antigos e novos de Favoritos com os mesmos oito IDs | Erro nas listas com chave, pins inconsistentes e remoção ambígua | Mantidos os oito exemplos com horários; posição de demonstração alinhada à mesma região |
| Entradas repetidas de CSS, Counter do starter e seletores de exemplos sem consumidores | Código desnecessário e cascade difícil de entender | Uma entrada de componentes em main.ts; removidos Counter, style.css, exemplos do Vite, grupos de filtro inexistentes e media queries vazias |
| Nome Benefit usado tanto para a entidade lógica quanto para um modelo visual de pin/card | Confundia dados de apresentação com o modelo do Backend | Modelo visual renomeado para BenefitLocation; roteamento recebe apenas coordenadas |
| Exemplo chamado `coisas loucas` com coordenadas fora dos limites do mapa | Pin demonstrativo inacessível | Removido o exemplo sem uso nos cards |
| Rótulo da seção da galeria apontando para um ID inexistente e classe de contato sem estilo/consumidor | Referência acessível inválida e nome enganoso | ID da seção corrigido e classe sem efeito removida |
| Documentação dizia que não havia telas, que `/` era a galeria e que os pins eram vermelhos | Orientava futuras alterações a partir de informações incompatíveis | Atualizados estado executável, rotas, mapa, inventário e comandos; o histórico de testes anteriores permanece identificado |

## Pontos mantidos para decisão da equipe

- **Navegação incompleta:** Categoria ainda possui abas sem destino conectado. No complemento solicitado para o Início, Saúde e Bem-Estar e Favoritos passaram a abrir suas rotas existentes; outras categorias filtram os pins demonstrativos e Mapa foca o mapa local. Favoritos conecta Início; o detalhe conecta Início/Favoritos e informa a indisponibilidade do Histórico. Não foi inventada uma tela de Histórico ou uma API.
- **Dados e favoritos locais:** os exemplos não são uma base unificada; favoritar em uma página não persiste automaticamente nas demais ou após recarregar. Depende da camada compartilhada e do contrato de favoritos.
- **Horários demonstrativos:** a regra atual de “aberto agora” usa horário local, mesmo dia e intervalos sem cruzar meia-noite. Fuso, feriados, períodos noturnos e múltiplos intervalos aguardam dados/regras do produto. A limpeza não alterou essa regra.
- **Tipos/regras de filtro semelhantes:** Categoria e Favoritos possuem busca e ordenação parecidas, mas a busca de Categoria inclui o contexto da categoria e Favoritos normaliza acentos e inclui desconto. Unificá-las sem definir o comportamento esperado mudaria os resultados atuais.
- **Serviços preparados sem consumidores:** geolocalização, OSRM e pontos manuais não são chamados pelas páginas atuais. Foram mantidos por fazerem parte da separação de responsabilidades documentada; a equipe deve confirmar sua adoção ou retirada. `VITE_OSRM_URL` pertence ao serviço preparado, não à API do produto.
- **Tipografia:** Login, alguns estilos de título e a galeria ainda citam Inter como primeira alternativa; as páginas de diretório/detalhe usam a pilha de sistema confirmada. Nenhuma fonte é baixada. Padronização visual dessas áreas exige revisar o design; esta limpeza preserva os valores existentes.
- **Stack e validação nativa:** a implementação é Svelte/Vite com Capacitor; React Native permanece apenas como requisito histórico. Os testes Android de exemplo ainda não validam funcionalidades do aplicativo. Build, permissões e comportamento em dispositivo Android não foram executados nesta revisão web.

## Validação

- `npm run check`: zero erros e zero avisos de Svelte/TypeScript após as correções.
- `npm test`: sete testes, cobrindo IDs únicos, coordenadas, localização demonstrativa, busca, ordenação sem mutação, horários e truncamento por palavras inteiras.
- `npm run build`: compilação de produção concluída.
- Chrome isolado: seis rotas × quatro dimensões (390 × 844, 844 × 390, 834 × 1194, 1194 × 834), totalizando 24 verificações sem erros JavaScript ou transbordamento horizontal.
- Conferidos: contagem de pins, IDs de elementos, filtros, seleção pin/card sem recriar o marcador, remoção de favoritos, estados vazios, diálogo de fachada, aviso do Login e expansão dos cards de benefício/unidade.
- Em Categoria/Favoritos, as posições e dimensões dos controles compartilhados foram comparadas; a navegação preserva sua posição e tamanho ao expandir/recolher a lista.

O solicitante autorizou o envio desta branch ao remoto após a padronização do Início. Nenhum endpoint ou regra de Backend foi criado.

## Complemento solicitado — padrão da tela inicial

Após a revisão, o solicitante pediu para aproximar o Início das demais páginas usando os componentes existentes. `MainPage` passou a reutilizar o layout de `DirectoryPage.css`, o mapa real na mesma variante de Categoria/Favoritos, os botões de categoria sem redução local de fontes/ícones e a navegação sem escalas específicas da página. `ScrollShadow` acompanha a rolagem da grade; o CSS local cuida somente do logo, grade, status e adaptação para celular deitado estreito.

As quatro dimensões de referência e 320 × 568 / 568 × 320 foram verificadas no navegador. Nas quatro medidas principais, as posições/dimensões de mapa, cabeçalho, título e navegação foram comparadas com Favoritos. Foram conferidos filtros locais, ausência de resultados, restauração por Início, foco do mapa e links existentes de Saúde/Favoritos. Após a apresentação do ajuste, o solicitante autorizou seu envio ao remoto.
