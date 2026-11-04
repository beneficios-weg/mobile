# Validação da integração API — 2026-10-28

Windows, Node 24.11.1, npm 11.6.2. Base `origin/develop` 640db5a; branch `codex/api-integration`. Este registro complementa, sem substituir, os relatórios de 2026-10-27.

| Verificação executada | Resultado |
|---|---|
| `npm ci --cache .npm-cache --no-audit --no-fund` | 150 pacotes instalados; aviso transitivo de depreciação uuid@7.0.3, sem alteração de dependência por inferência |
| `npm run check` | Código 0; zero erros e avisos Svelte/TypeScript |
| `npm test` | 30 aprovados, zero falhas: 12 anteriores e 18 novos |
| `npm run build` | Código 0; produção gerada em `dist/` |
| `npm exec -- cap sync android` | Código 0; assets e configuração copiados; plugin geolocation existente sincronizado |
| Navegador + HTTP fixture local | Login por username com cookie; 70 estabelecimentos via duas páginas; detalhe ONLINE sem mapa/rota/horário; favorito no servidor simulado; reload com HTTP 503 preservou cache IndexedDB; desfavoritar offline; Atualizar após reconexão enviou a fila |
| Navegador 390×844 | Histórico confirmou a visita da API simulada e exibiu somente o pin físico |
| GET público no Render | Health UP; OpenAPI confirmou as sete famílias de rotas consumidas e os campos do DTO de estabelecimento; nenhuma gravação autenticada |

Evidências de saída: [check](evidencias/2026-10-28/check.txt), [30 testes](evidencias/2026-10-28/testes.txt), [build](evidencias/2026-10-28/build.txt) e [sync Android](evidencias/2026-10-28/android-sync.txt).

Os novos testes cobrem paginação, resposta inválida, mensagens genéricas sem conteúdo sensível, ausência de retry de login, ONLINE e coordenadas inválidas, benefício compartilhado/textos literais, histórico, cache offline, 401 antes/durante replay, troca de conta inclusive durante um refresh, segredo fora do cache, falha parcial, falha de storage, logout, indisponibilidade do servidor, autenticação malformada e acknowledgement que preserva intenção mais recente.

Para testar a orquestração, o arquivo Svelte é compilado pelo compilador já instalado com o alvo server, substituindo somente transporte/cache/navegação por doubles. Isso verifica regras e chamadas, sem afirmar cobertura da reatividade do navegador ou cookie nativo. O ensaio no navegador complementou o teste com IndexedDB e cookies HTTP reais contra a fixture local. Nenhum teste gravou dados na API de produção, criou conta real ou enviou e-mail.

Não executados: APK, aparelho/emulador, login autenticado no Render, persistência de cookie entre reinícios do Android, permissões/precisão/bateria/background, detector de visitas e medições de desempenho. A fila de novas visitas não foi implementada; somente favoritos offline e leitura de visitas confirmadas fazem parte desta entrega. Não foi medido percentual de cobertura.

Revisão final do navegador: foram encontrados avisos Svelte `assignment_value_stale` nos callbacks que retornavam a atribuição de viewport. Os quatro callbacks foram convertidos em blocos sem retorno; check, build e sync Android passaram novamente. Após reload, a navegação por catálogo, favoritos, histórico e detalhe físico não produziu novos avisos/erros na janela observada. O logout da fixture também retornou ao formulário de login.