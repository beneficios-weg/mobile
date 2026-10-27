# Plano de testes do sistema

## Objetivo e versão de referência

Orientar a verificação do WEG Benefits Mobile, permitir a repetição dos cenários e distinguir resultados obtidos de funcionalidades ainda planejadas. A referência desta edição é o código do commit `0c44191`, com Svelte/Vite, Leaflet e configuração Android do Capacitor. A documentação foi consolidada na branch `docs/system-testing`.

O sistema atual é uma prévia web com dados demonstrativos. Entrar abre o Início sem autenticação real; favoritos e estados de navegação ficam em memória; Visitados não representa visitas detectadas. Não usar esta validação para afirmar que API, autenticação, persistência, modo offline ou aplicação nativa foram homologados.

## Documentos e evidências

| Documento | Uso |
|---|---|
| [Casos de teste](testes/casos-de-teste.md) | Pré-condições, ações e resultados esperados por funcionalidade |
| [Relatório de execução](testes/relatorio-execucao.md) | Ambiente, versão, resultados efetivamente executados e limitações |
| [Evidências da execução](testes/evidencias/2026-10-27/) | Saídas de check, testes e build desta consolidação |
| [Histórico de validações](testes/historico-validacoes.md) | Registros anteriores preservados, incluindo aprovações visuais |
| [Navegação](navegacao.md) | Rotas e comportamento da prévia |
| [Componentes de UI](componentes-ui.md) | Padrões visuais e expansões aprovadas |

Os casos definem o que verificar. Somente um relatório com versão, resultado e evidência comprova execução. Um caso documentado não deve ser contado automaticamente como aprovado.

## Escopo

| Área | Verificação disponível agora | Dependências futuras |
|---|---|---|
| Login | Campos obrigatórios, formato de e-mail, aviso e entrada de prévia | Autenticação, sessão, primeiro acesso e recuperação |
| Início e categorias | Sete categorias, listas, busca, filtros, contador e estados vazios | Dados, filtros e paginação da API |
| Navegação | Rotas, retorno, histórico, estado em memória e menu animado | Navegação nativa em dispositivo e configuração da hospedagem |
| Favoritos e Visitados | Favoritos compartilhados na sessão; histórico demonstrativo independente | Persistência, sincronização e visitas reais |
| Estabelecimento | Dados do registro, favorito, links e cards expansíveis | Dados reais e foto da fachada |
| Mapa | Tiles/pins atuais, seleção, expansão modal, busca/sugestões e controles | Localização real, regras de proximidade e serviços integrados |
| Responsividade e acessibilidade | Quatro viewports, foco, teclado e estados acessíveis | Dispositivos físicos, leitores de tela e auditoria completa |

## Ambiente e preparação

1. Registrar branch e commit com `git status -sb` e `git rev-parse HEAD`.
2. Usar Node/npm compatíveis com o projeto. A execução registrada usou Node `24.11.1` e npm `11.6.2`; essas versões são o ambiente observado, não uma nova política de suporte.
3. Em uma instalação nova, executar `npm ci` com o `package-lock.json` versionado. A execução registrada utilizou dependências já instaladas; não incluiu uma nova instalação limpa.
4. Iniciar o servidor e abrir a URL informada pelo Vite. Para os endereços usados nos roteiros:

```sh
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

5. Abrir as ferramentas de desenvolvimento do navegador, acompanhar erros de console e configurar o viewport conforme a matriz abaixo. Manter conexão para os tiles externos do OpenStreetMap.
6. Iniciar cada caso independente com recarregamento da rota inicial indicada. Isso restaura os exemplos em memória. Dentro de um caso de navegação, não recarregar, exceto quando o próprio passo solicitar.

Usar somente valores fictícios no Login, como `teste@example.com` e uma senha de exemplo. Não são necessárias credenciais, chaves ou API do produto para testar a prévia.

## Níveis e ferramentas

| Nível | Comando ou método | O que comprova |
|---|---|---|
| Análise estática | `npm run check` | Diagnósticos Svelte/TypeScript e configuração TypeScript do projeto |
| Regressão de funções puras | `npm test` | 12 testes em [regressions.test.mjs](../tests/regressions.test.mjs), com Node Test Runner e compilador TypeScript existente |
| Compilação | `npm run build` | Geração de `dist/`; não comprova comportamento visual ou integração |
| Funcional e visual web | Casos manuais e inspeção no navegador | Jornadas, posições, animações, foco e interação entre componentes |
| Integração/nativo | Casos bloqueados descritos no catálogo | Dependem de contrato, implementação, ambiente e/ou dispositivo |

Executar os comandos abaixo individualmente e registrar o código de saída de cada um:

```sh
npm run check
npm test
npm run build
```

Não há comando E2E nem suíte permanente de navegador configurados no `package.json`. As verificações anteriores no Chrome foram realizadas com automação temporária e inspeção de capturas; o catálogo permite repeti-las manualmente. Os exemplos JUnit existentes em `android/` não cobrem os fluxos do produto e não foram executados nesta consolidação.

## Matriz de dispositivos e navegadores

| Identificador | Viewport CSS | Uso |
|---|---|---|
| CEL-P | 390 × 844 | Celular em pé |
| CEL-D | 844 × 390 | Celular deitado |
| TAB-P | 834 × 1194 | Tablet em pé |
| TAB-D | 1194 × 834 | Tablet deitado |

Repetir os casos responsivos nos quatro tamanhos, mantendo o zoom do navegador em 100%. Conferir também a troca de orientação sem recarregar. `700 × 390`, `320 × 568` e `568 × 320` são tamanhos complementares usados em registros anteriores; não substituem a matriz principal.

Chrome no Windows foi o navegador observado nas validações existentes. Emulação de viewport não equivale a teste em aparelho físico. Firefox, Safari/iOS, Android instalado, teclado virtual, áreas seguras reais e leitor de tela precisam de execuções próprias registradas.

## Dados e cuidados com a interpretação

Os exemplos estão em `src/pages/catalog.ts`, `favorites.ts`, `establishment.ts` e `services/benefitsService.ts`. O catálogo inicial possui oito favoritos e oito registros de Visitados; Saúde e Bem-Estar contém oito estabelecimentos. Lazer e Estética e Vestuário são categorias válidas sem exemplos. Os números são dados da versão de referência, não limites do produto.

- Unidades com o mesmo nome podem ter IDs, bairros e coordenadas diferentes. Comparar o registro selecionado, não apenas o título.
- Favoritos e mapa normalizam acentos na busca. Categoria/Visitados usam a busca local existente, sem a mesma normalização; usar `Ótica` nesses roteiros. Essa diferença está registrada para alinhamento da equipe, sem alteração de comportamento nesta documentação.
- Horários são locais e demonstrativos: abertura inclusiva, fechamento exclusivo, sem feriados ou intervalos noturnos. Não inferir regras do Backend.
- Reload restaura os exemplos e limpa a sessão de prévia. Não registrar isso como falha de persistência antes de a persistência ser implementada.
- O mapa depende de tiles externos. Diferenciar falha de carregamento dos tiles de erro na lista, pins ou navegação.

## Priorização e critérios de aceite

P0 identifica navegação e fluxos básicos; P1 identifica recursos principais, responsividade e acessibilidade de interação; P2 identifica verificações complementares. A prioridade orienta a ordem de execução, sem dispensar os demais casos aplicáveis à entrega.

Uma alteração pode ser apresentada para revisão quando check, testes relevantes e build passarem; os casos afetados tiverem resultado registrado; não houver falha crítica aberta nos fluxos alterados; e as quatro composições estiverem verificadas quando a alteração atingir layout. Não é necessário repetir casos sem relação com uma alteração já validada.

A aprovação visual pertence ao solicitante. Registrar essa aprovação separadamente do resultado técnico. Um cenário bloqueado por integração não deve ser marcado como aprovado ou como falha de uma funcionalidade que ainda não foi implementada. Publicação em produção ou homologação nativa exige critérios adicionais após definição das integrações.

## Registro de execução e defeitos

Para cada rodada, registrar versão, data/fuso, responsável ou agente executor, ambiente, dados, viewport, IDs executados, resultado obtido e evidências. Estados permitidos: **Aprovado**, **Falhou**, **Não executado**, **Bloqueado** e **Não aplicável**, sempre com justificativa nos dois últimos. Aprovações anteriores ficam no histórico, sem serem apresentadas como uma nova execução.

Modelo de ocorrência:

```text
Caso / título:
Commit / branch / data / executor:
Navegador / sistema / viewport:
Pré-condições e dados fictícios:
Passos para reproduzir:
Resultado esperado:
Resultado obtido:
Status / impacto:
Evidência (arquivo, captura ou saída do comando):
Correção e resultado do reteste:
```

Usar identificadores estáveis dos casos, preservar evidências anteriores e evitar dados pessoais, credenciais ou tokens nas capturas. A cobertura atual é descrita por cenários e testes existentes; não foi calculado percentual de cobertura de código.
