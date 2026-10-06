# Testes mobile

## Estado

Não há aplicação, `package.json`, testes automatizados ou build executável nesta consolidação. Os casos abaixo são um roteiro de aceite. “Resultado obtido” será preenchido durante a execução real.

| Cenário | Pré-condição | Passos | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|
| Login válido | Usuário ativo e API disponível | Informar credenciais válidas e enviar | Sessão criada e navegação para Início conforme contrato | Não executado | Bloqueado: sem app/API |
| Login inválido | API disponível | Enviar credenciais inválidas | Erro contratado, sem criar sessão | Não executado | Bloqueado |
| Primeiro acesso | Usuário elegível | Abrir fluxo e concluir etapas contratadas | Conta habilitada sem atalhos de validação | Não executado | Bloqueado |
| Recuperação | Identidade de teste | Solicitar recuperação e seguir retorno contratado | Feedback seguro e conclusão do fluxo | Não executado | Bloqueado |
| Landing | Sessão válida, dados disponíveis | Abrir Início | Mapa/categorias, estados e benefício próximos coerentes | Não executado | Bloqueado |
| Categorias | Categorias e lojas disponíveis | Escolher categoria | Lista e mapa refletem o mesmo filtro | Não executado | Bloqueado |
| Pesquisa | Conjunto conhecido em cache/API | Pesquisar nome existente e inexistente | Resultados corretos e estado vazio contextual | Não executado | Bloqueado |
| Favoritos | Sessão válida e estabelecimento disponível | Favoritar, navegar e desfavoritar | Estado consistente e independente de visitas | Não executado | Bloqueado |
| Mapa cheio | Dados e mapa disponíveis | Abrir mapa a partir de uma tela filtrada | Viewport expandido preserva contexto e seleção | Não executado | Bloqueado |
| Permissão de localização concedida | Localização habilitada | Acionar função e conceder permissão | Posição usada apenas para finalidade informada | Não executado | Bloqueado |
| Localização negada | Permissão não concedida | Negar ou bloquear permissão | App permanece navegável e orienta alternativa | Não executado | Bloqueado |
| Detecção de visita válida | Parâmetros aprovados e local simulado controlado | Permanecer no candidato pelo período e condições definidos | Um candidato, sem duplicidade; envio conforme contrato | Não executado | Bloqueado |
| GPS inconsistente | Amostras imprecisas/oscilantes | Simular proximidade instável | Nenhuma visita confirmada e pontos descartados | Não executado | Bloqueado |
| Candidatos sobrepostos | Dois estabelecimentos próximos | Simular janela coerente com um dominante | Regra aprovada seleciona no máximo um candidato | Não executado | Bloqueado |
| Offline com cache | Cache válido e rede desabilitada | Abrir Início/Categoria/Loja | Conteúdo em cache com `lastSyncAt` e aviso | Não executado | Bloqueado |
| Offline sem cache | App sem cache e rede desabilitada | Abrir tela remota | Estado offline claro, sem conteúdo inventado | Não executado | Bloqueado |
| Sincronização | Operação permitida na fila e rede restaurada | Voltar online e acionar gatilho | Operação processada uma vez, estado atualizado | Não executado | Bloqueado |
| Erro 4xx da API | API preparada para erro contratado | Executar a ação | Mensagem/ação coerente; sem retry infinito | Não executado | Bloqueado |
| Erro 5xx/timeout | API indisponível | Abrir ou atualizar tela | Cache preservado e retry controlado | Não executado | Bloqueado |
| Logout/troca de usuário | Duas contas de teste | Armazenar cache, sair e entrar com outra conta | Nenhum dado pessoal cruza contas | Não executado | Bloqueado |

## Verificações transversais

- Android e iOS nas versões suportadas, quando definidas;
- acessibilidade de ícones, foco, contraste e tamanho de fonte;
- ausência de tokens, senhas e coordenadas em logs;
- consumo de bateria e permissões de localização;
- transições entre loading, vazio, erro, cache e conteúdo atualizado;
- links e navegação de retorno;
- deduplicação de visitas e operações offline conforme contrato.

## Automação futura

Ferramentas e divisão entre testes unitários, de componentes e end-to-end são **DECISÃO PENDENTE**. Priorizar funções puras de distância/consistência, adaptadores de API/storage e fluxos críticos. Não adicionar framework antes de existir uma implementação mínima e uma decisão registrada.
