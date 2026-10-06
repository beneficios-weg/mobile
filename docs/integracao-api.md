# Integração com a API

## Regra de autoridade

O Backend é a fonte de verdade para endpoints, métodos, payloads, códigos HTTP, autenticação, validações, modelos e campos calculados. Na consolidação, o contrato publicado não estava disponível e os nomes de repositório backend consultados não puderam ser acessados. Portanto, esta página não cria um contrato alternativo.

## Matriz de consumo

| Tela/fluxo | Endpoint consumido | Quando é chamado | Loading | Vazio | Erro | Offline |
|---|---|---|---|---|---|---|
| Login | **A confirmar no Backend** | Ao enviar credenciais | Bloquear reenvio e indicar progresso | Não se aplica | Mensagem conforme código contratado | Não presumir login offline |
| Primeiro acesso | **A confirmar no Backend** | Ao iniciar e concluir etapas | Progresso por etapa | Não se aplica | Preservar dados seguros e orientar correção | Sem comportamento definido |
| Recuperação | **A confirmar no Backend** | Ao solicitar recuperação | Evitar solicitações duplicadas | Não se aplica | Mensagem sem expor existência de conta | Sem comportamento definido |
| Início | **A confirmar no Backend** | Ao entrar, atualizar ou mudar contexto de localização | Manter cache visível | Explicar ausência de categorias/lojas | Tentar novamente sem apagar cache | Categorias e lojas em cache + `lastSyncAt` |
| Categoria | **A confirmar no Backend** | Ao selecionar categoria, pesquisar, filtrar ou paginar se contratado | Skeleton/indicador contextual | Nenhum estabelecimento no filtro | Preservar filtro e permitir retry | Filtrar cache elegível |
| Loja | **A confirmar no Backend** | Ao abrir detalhes | Indicador na área de conteúdo | Registro indisponível | Voltar ou tentar novamente | Detalhe em cache, identificado como desatualizado |
| Favoritos | **A confirmar no Backend** | Ao abrir lista e ao favoritar/desfavoritar | Indicar carga ou mutação | Orientar como adicionar | Rollback ou pendência conforme estratégia aprovada | Cache; mutação somente se contrato permitir fila |
| Mapa cheio | Reutiliza consultas confirmadas da origem | Ao abrir ou mudar viewport, se contratado | Não bloquear navegação do mapa | Sem pins no contexto | Exibir falha sem perder viewport | Pins em cache e posição local disponível |
| Lojas visitadas | **A confirmar no Backend** | Ao abrir/atualizar histórico | Manter cache visível | Explicar ausência de visitas | Permitir retry | Histórico confirmado em cache |
| Envio de visita | **A confirmar no Backend** | Após candidato elegível | Não bloquear a tela atual | Não se aplica | Enfileirar somente se permitido | `SYNC_QUEUE` sem pontos GPS brutos |

## Referências não contratuais do briefing

O escopo recebido citou apenas como exemplos `GET /categories`, `GET /establishments`, `GET /establishments/:id`, filtro `favoritesOnly=true` e `GET /visits`. Esses formatos **não foram validados** e não devem ser usados na implementação até aparecerem no contrato do Backend.

## Responsabilidades do cliente

- aplicar base URL e credenciais pelo mecanismo aprovado;
- enviar somente headers e payloads contratados;
- tratar códigos HTTP sem converter erros em sucesso local;
- cancelar ou ignorar respostas obsoletas quando o contexto da tela mudar;
- evitar logs com token, senha ou dados pessoais;
- mapear dados para a UI sem alterar o significado do Backend;
- preservar `lastSyncAt` somente após sucesso válido.

## Autenticação

Tipo de credencial, headers, renovação, expiração, logout e armazenamento seguro são **DECISÃO PENDENTE DO BACKEND/INTEGRAÇÃO**. O Mobile não deve adotar JWT, OAuth, cookies ou qualquer esquema por inferência.

## Itens necessários do Backend

1. especificação versionada de endpoints e exemplos de payload;
2. regras e códigos de autenticação, primeiro acesso e recuperação;
3. paginação, busca, filtros e ordenação suportados;
4. origem de coordenadas, distância e demais campos calculados;
5. contrato de favoritos e visitas, incluindo idempotência;
6. política de erros e rate limiting;
7. URL por ambiente e forma segura de configuração.
