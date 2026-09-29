# Offline e sincronização

## Objetivo

Manter o aplicativo útil em conectividade limitada sem confundir cache com a fonte oficial. A solução deve ser simples e proporcional ao MVP. Nenhuma tecnologia de armazenamento foi escolhida.

## Dados remotos

São definidos e validados pelo Backend:

- categorias;
- estabelecimentos;
- benefícios;
- favoritos, se houver persistência no servidor;
- visitas confirmadas;
- sessão e perfil, conforme contrato.

O cache desses dados é uma cópia local e pode estar desatualizado. Cada conjunto deve registrar `lastSyncAt` para permitir comunicação clara e política de expiração futura.

## Dados locais

- cache de leitura dos dados remotos;
- `lastSyncAt` por conjunto ou chave de cache;
- preferências estritamente locais, se aprovadas;
- candidatos mínimos de visita ainda não enviados, quando o contrato permitir;
- operações pendentes em `SYNC_QUEUE`.

Pontos GPS brutos não devem ser mantidos como dados locais permanentes.

## Estratégia simples de cache

1. Renderizar cache disponível imediatamente, identificando conteúdo potencialmente desatualizado.
2. Quando online, buscar a versão remota e substituir o cache somente após resposta válida.
3. Atualizar `lastSyncAt` após sincronização bem-sucedida, não apenas após uma tentativa.
4. Em erro, preservar o último cache válido e permitir nova tentativa.
5. Em logout ou troca de usuário, isolar ou limpar dados pessoais conforme decisão de segurança.

Expiração, limites de tamanho e invalidação por versão são **DECISÃO PENDENTE**.

## SYNC_QUEUE

Modelo conceitual para operações offline que precisam chegar ao servidor:

| Campo | Finalidade |
|---|---|
| `id` | Identificador local da operação |
| `operation` | Ação pretendida, sem criar verbos da API |
| `entityType` | Tipo lógico da entidade |
| `entityId` | Identificador conhecido, quando houver |
| `payload` | Dados mínimos compatíveis com o contrato |
| `createdAt` | Momento de criação local |
| `retryCount` | Quantidade de tentativas concluídas |
| `status` | Situação local da operação |

Este formato não é payload de endpoint nem modelo do Backend.

## Processamento conceitual

- executar somente quando houver sessão válida e conectividade;
- ordenar quando houver dependência entre operações;
- marcar a operação em processamento para evitar concorrência local;
- remover ou concluir somente após confirmação inequívoca do Backend;
- aumentar `retryCount` em falha recuperável e aplicar espera controlada;
- interromper repetição automática em falha permanente e expor ação ao usuário;
- usar idempotência apenas se e como o Backend definir.

## Conflitos

O Mobile não define autoridade ou resolução de conflito. Para favoritos, visitas e quaisquer mutações, prevalece a regra publicada pelo Backend. Até essa definição, não assumir last-write-wins, merge ou sobrescrita silenciosa.

## Segurança

- não armazenar senha;
- usar armazenamento protegido para credenciais ou tokens conforme a futura estratégia de autenticação;
- não incluir secrets em cache, fila ou logs;
- minimizar dados pessoais no payload enfileirado;
- isolar dados por usuário autenticado.

## DECISÃO PENDENTE

- mecanismo de armazenamento local;
- política de expiração e limites do cache;
- mutações autorizadas offline;
- autenticação e renovação de sessão offline;
- idempotência, deduplicação e conflitos;
- gatilho de sincronização em foreground/background;
- comportamento de logout e troca de conta.
