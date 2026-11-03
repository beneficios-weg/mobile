# Integração Mobile com a API — 2026-10-28

Esta entrega conecta o Mobile Svelte/Capacitor ao contrato atual do [Backend](https://github.com/beneficios-weg/backend-api/blob/develop/docs/api-contract.md). Os trechos anteriores que descrevem login de prévia, favoritos somente em memória, autenticação pendente, redefinição de senha, horários, avaliações ou marcas são registros históricos e não definem esta integração.

## Execução no Windows PowerShell

```powershell
Set-Location C:\Users\samuel_silva-mello\Desktop\weg-benefits
npm ci
Copy-Item .env.example .env.local  # somente na primeira configuração; não sobrescrever um arquivo próprio
npm run dev
```

Abra `http://127.0.0.1:5173`. Use uma conta já cadastrada pelo ADMIN; a integração não cria usuários nem envia e-mails. Senha inválida não é corrigida automaticamente. O Render gratuito pode levar alguns minutos no primeiro acesso; o cliente aguarda até 300 segundos e não repete o POST de login automaticamente.

O navegador usa `/backend` como proxy **local** de mesma origem do Vite. `API_PROXY_TARGET` aponta para `https://weg-benefits-api.onrender.com`; para testar o Backend local, use `http://localhost:8081`. O proxy remove o atributo Secure somente na resposta ao navegador HTTP local e remove Origin no pedido servidor-servidor. Cookies da API em produção continuam Secure/HttpOnly/SameSite=Lax. O servidor local fica restrito a `127.0.0.1`; não expor o Vite à Internet.

```powershell
npm run check
npm test
npm run build
npm exec -- cap sync android
npm exec -- cap open android
```

No Android, `VITE_API_URL` é HTTPS e o transporte usa `CapacitorHttp` nativo com o gerenciador de cookies do Capacitor. Não lê o cookie HttpOnly em JavaScript nem o transforma em JWT. `loggingBehavior: 'none'` evita logs da ponte nativa com payloads e cookies. Alterar uma variável VITE exige novo build/sync. Nenhum segredo pode ser colocado em `VITE_*`.

Um build web publicado precisa de um proxy HTTPS `/backend` na mesma origem, preservando os atributos seguros dos cookies, ou de um alinhamento próprio de hospedagem/autenticação. Publicar somente `dist/` em uma hospedagem estática não cria esse proxy; `credentials: include` e CORS isoladamente não resolvem o cookie SameSite entre sites diferentes. A API não foi alterada para contornar essa restrição.

## Rotas consumidas

| Fluxo | Método e rota | Comportamento |
|---|---|---|
| Entrar | `POST /v1/auth/login` | `{login,password}`; aceita username ou e-mail; limpa senha do formulário após a tentativa |
| Restaurar/validar sessão | `GET /v1/me` | Valida a conta antes de enviar favoritos pendentes |
| Sair | `POST /v1/auth/logout` | Limpa a interface após sucesso; falha de rede mantém aviso e exige nova tentativa |
| Categorias | `GET /v1/categories` | Percorre todas as páginas |
| Estabelecimentos | `GET /v1/establishments` | Percorre páginas de até 50, sem UUIDs fixos |
| Benefício do estabelecimento | `GET /v1/establishments/{id}/benefits` | Uma consulta por benefício compartilhado, até quatro simultâneas |
| Favoritos | `GET /v1/me/favorites` | Percorre todas as páginas e relaciona aos estabelecimentos ativos |
| Favoritar/desfavoritar | `PUT/DELETE /v1/me/favorites/{establishmentId}` | Fila persistente por conta; operação idempotente |
| Histórico | `GET /v1/me/visits` | Percorre todas as páginas; lista estabelecimentos ativos ordenados pela visita mais recente |

Não há consumo de rotas administrativas. Histórico não cria visitas ao clicar, favoritar ou abrir detalhes. O cache conserva todos os eventos recebidos, mas a tela agrupa por estabelecimento e só dispõe de detalhes dos estabelecimentos atualmente publicados. A detecção e o POST de novas visitas ficam para uma etapa própria.

## Modelo e apresentação

- Os DTOs HTTP estão em `src/api/types.ts`, separados dos exemplos de domínio e de apresentação. `catalog.ts`, `establishment.ts` e os demais `preview*` continuam como fixtures da galeria/testes; as rotas reais usam `siteState.svelte.ts` e `apiAdapters.ts`.
- Cada estabelecimento tem um benefício; o benefício pode ser compartilhado. Todos os descontos e instruções mantêm o texto recebido, inclusive erros e quebras de linha. Não se adiciona `% OFF` a valores arbitrários e não existe `conditions` no DTO de benefício.
- ONLINE participa da lista, detalhe e favoritos; não gera pin, rota, endereço ou coordenadas inventados. PHYSICAL/HYBRID entram no mapa somente com `mappable=true` e coordenadas finitas/válidas. O componente Map continua apresentacional.
- Sem leitura real da localização nesta etapa: não mostrar posição ou distâncias fictícias. Ordenação por proximidade, maior desconto numérico e horário foi retirada das telas conectadas porque esses dados/regras não estão disponíveis. Ordenação alfabética permanece.
- `iconKey` e `colorHex` vêm da categoria da API. Baixa-se somente o SVG dos ícones selecionados que ainda não estejam no cache. O SVG é exibido como imagem, nunca injetado como HTML; pictogramas locais servem de fallback sem impedir a navegação. [Formato oficial da API Iconify](https://iconify.design/docs/api/svg.html).

## Offline e isolamento

Decisão técnica desta entrega: IndexedDB da WebView/navegador, sem dependência adicional, para catálogo, perfil mínimo, favoritos, visitas confirmadas, fila e ícones. Snapshot com versão 1 e `syncedAt`, separado por ID inteiro da conta; não armazena senha, hash, cookie, token ou pontos GPS. Retenção sem prazo até reconexão, conforme D-051. Armazenamento local do app não é backup: limpar dados/desinstalar ou a política de armazenamento do navegador pode removê-lo.

Depois de um acesso online, indisponibilidade de rede/servidor permite consultar a última cópia salva. Isso não autentica uma nova conta offline nem confirma que uma sessão ainda seja válida. Android inclui o código do app no APK; o navegador precisa já ter carregado a aplicação, pois esta entrega não adiciona service worker/PWA. Tiles OSM e fachadas externas não têm download offline implementado; os dados e pins podem existir sem imagem do mapa.

Favoritos são salvos na fila antes do envio. A reconexão e o botão Atualizar validam `/v1/me`, enviam apenas operações daquela conta e conciliam a lista. Um acknowledgement não apaga alterações posteriores. Falha de gravação local reverte o toggle e avisa; erro transitório mantém a fila. Estabelecimento indisponível (400/404/409 na mutação) descarta a operação com aviso. `401` bloqueia sincronização, retira dados pessoais da tela e oferece apagar a fila da conta indisponível, sem revelar motivo. A fila nunca muda de dono; logout/troca de conta preserva filas isoladas sem reenviá-las sob outra identidade.

O cache completo só é substituído depois das consultas válidas. Atualização parcial/falha preserva a última cópia e seu horário. Logout requer reconexão para invalidar a sessão no servidor. Não há CSRF dedicado, conforme decisão acadêmica do Backend; o risco de ações no navegador com sessão ativa permanece registrado.

## Validação e próximos passos

Resultados reais desta entrega estão em [Relatório da integração](testes/integracao-api-2026-10-28.md). Testes com transporte simulado não comprovam Gmail, credenciais reais, cookie nativo ou visita em segundo plano.

Próximo passo: homologar login real no Android, persistência após reiniciar e logout; então implementar localização mediante permissão e fechar raio/precisão/intervalo/desempate para detectar os três minutos de permanência. Não adicionar trilha GPS, geocodificação Geoapify ou chave privada ao Mobile por inferência.
