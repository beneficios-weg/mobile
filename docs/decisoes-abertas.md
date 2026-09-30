# Decisões abertas e inconsistências

## Como usar

Cada item marcado como **DECISÃO PENDENTE** precisa de responsável e registro da decisão antes que a documentação seja promovida de “planejada” para “implementada”. Recomendações não são decisões.

## Inconsistências encontradas

| Situação | Comportamento documentado | Comportamento encontrado | Impacto | Recomendação |
|---|---|---|---|---|
| Implementação mobile | Aplicativo React Native com sete telas | A branch base tinha apenas `README.md` com `# mobile`; não havia `package.json` ou `src/` | Instalação, execução, arquitetura e testes não são verificáveis | Inicializar o app somente após confirmar stack e contrato; atualizar docs com scripts reais |
| Designs | Usar designs existentes no repositório | Nenhum arquivo de design foi encontrado; apenas um link Figma em branch remota | Componentes, rotas e tokens não podem ser validados visualmente | Validar acesso/versão do Figma e versionar exports essenciais ou instruções |
| Stack adicional | Branch documental cita Expo, TypeScript e React Navigation | Não há dependências ou configuração que comprovem essas escolhas | Risco de documentar tecnologia como implementada | Equipe deve aprovar a stack e então registrar a decisão |
| Contrato da API | Backend deve ser fonte de verdade e sustentar matriz por tela | Contrato e repositório Backend não estavam disponíveis pelos nomes consultados | Endpoints, payloads, autenticação e códigos não podem ser confirmados | Backend publicar especificação versionada e informar URL correta |
| Visitas | Detecção usa proximidade, ~3 min, movimento, precisão, consistência e comparação | Não há algoritmo implementado nem parâmetros oficiais | Alto risco de falsos positivos e incompatibilidade com servidor | Definir parâmetros e divisão de responsabilidades com Backend antes de codificar |
| README remoto | Documenta raio de 15–60 m, altitude, navegação externa e detalhes de produtos | Esses requisitos não aparecem no briefing consolidado nem em código | Escopo pode crescer com afirmações não confirmadas | Produto/Backend confirmar ou remover em decisão registrada |

Todos os itens desta tabela são **DECISÃO PENDENTE**.

## Registro de decisões pendentes

| ID | Decisão | Opções/restrições conhecidas | Dependência | Recomendação não vinculante |
|---|---|---|---|---|
| DP-01 | Stack executável | React Native é obrigatório; Expo/TypeScript ainda não comprovados | Frontend/equipe | Escolher caminho com menor configuração para o prazo |
| DP-02 | Biblioteca de mapas | Deve suportar pins, viewport e plataformas alvo | Frontend, licenças e chaves | Fazer spike curto antes de consolidar |
| DP-03 | Biblioteca de localização | Permissão, precisão e possível background | Frontend/plataformas | Alinhar com a decisão de mapas e bateria |
| DP-04 | Armazenamento local | Tecnologia ainda não escolhida | Frontend e requisitos de segurança | Medir volume e necessidade relacional antes de decidir |
| DP-05 | Estado mobile | Escopo pequeno, evitar overengineering | Frontend | Começar com recursos nativos da stack sempre que bastarem |
| DP-06 | Segundo recurso nativo | Geolocalização já conta como um; falta outro | Produto/Frontend | Compartilhamento nativo é sugestão de baixa complexidade, não decisão |
| DP-07 | Background | Coleta e sync podem afetar privacidade e bateria | Produto/plataformas/Backend | Manter foreground até aprovação explícita |
| DP-08 | Estratégia final de sync | Fila, retry, conflitos, idempotência | Backend | Definir contrato antes de mutações offline |
| DP-09 | Autenticação | Esquema, refresh, storage seguro, primeiro acesso | Backend | Aguardar contrato publicado |
| DP-10 | Contrato de API | Rotas, payloads, HTTP e filtros | Backend | Disponibilizar OpenAPI ou documento versionado |
| DP-11 | Parâmetros de visita | Raio, precisão, janela, intervalo, desempate | Backend/Produto/Frontend | Usar dados observáveis e testes de campo após definição |
| DP-12 | Protótipo vigente | Link Figma existe, mas acesso/versão não validados | Design/Produto | Fixar página/versão e exportar tokens essenciais |
| DP-13 | Favoritos | Autoridade, offline, conflitos e endpoint | Backend | Separar sempre de visitas |
| DP-14 | Retenção local | Cache, logout, troca de conta e dados pessoais | Segurança/Frontend | Minimizar e isolar por usuário |

## Dependências do Backend

- URL correta e acesso ao repositório ou contrato publicado;
- DER/modelos relevantes apenas como referência de consumo;
- autenticação, primeiro acesso e recuperação;
- endpoints e payloads de categorias, estabelecimentos, benefícios, favoritos e visitas;
- paginação, busca, filtros e ordenação;
- campos calculados, coordenadas e regras de proximidade;
- criação/deduplicação de visitas e idempotência;
- códigos HTTP, formato de erro e ambientes.

## Critério para encerrar uma decisão

Registrar data, participantes, alternativa escolhida, justificativa e documentos/código afetados. Atualizar esta página, a documentação temática e os testes correspondentes no mesmo Pull Request.
