# Visão geral

## Produto

WEG Benefits é um aplicativo corporativo para colaboradores encontrarem benefícios em estabelecimentos parceiros próximos. O mapa é o principal elemento de descoberta, complementado por categorias, busca, favoritos e histórico de visitas.

## Objetivos do MVP

- autenticar o colaborador conforme o contrato do Backend;
- apresentar estabelecimentos e benefícios relevantes por proximidade;
- permitir navegação por categoria, pesquisa e detalhes;
- manter favoritos sem vinculá-los ao histórico de visitas;
- registrar visitas automaticamente com sinais de localização consistentes;
- oferecer experiência útil com conectividade limitada por meio de cache local;
- manter a solução compatível com o limite de aproximadamente 30 horas e quatro integrantes.

## Escopo

| Área | Incluído |
|---|---|
| Telas | Login, Início, Categoria, Loja, Favoritos, Mapa em tela cheia, Lojas visitadas |
| Fluxos auxiliares | Primeiro acesso e recuperação de senha |
| Navegação | Floating Tab Bar e navegação contextual |
| Localização | Proximidade, mapa e sinais temporários para visita |
| Offline | Cache de leitura, `lastSyncAt` e fila conceitual de operações |
| API | Consumo do contrato definido pelo Backend |

Não fazem parte da detecção de visitas: QR Code, NFC, confirmação manual, BLE, UWB ou IA. Também não está prevista a persistência permanente do trajeto do usuário.

## Princípios

1. **Backend como fonte de verdade:** o Mobile não cria endpoints, payloads ou regras de autenticação.
2. **Transparência:** fatos encontrados, planos e decisões pendentes são identificados separadamente.
3. **Simplicidade:** priorizar o caminho mais curto que satisfaça o MVP.
4. **Offline previsível:** dados remotos em cache não se confundem com dados locais ou operações pendentes.
5. **Privacidade por minimização:** pontos de localização existem somente durante a janela necessária de análise.

## Glossário

| Termo | Significado |
|---|---|
| Estabelecimento | Loja ou parceiro que oferece benefício ao colaborador |
| Benefício principal | Oferta destacada do estabelecimento no MVP |
| Favorito | Preferência explícita do usuário, independente de visita |
| Visita | Evento reconhecido após análise de proximidade, tempo, movimento, precisão e consistência |
| Dados remotos | Dados cuja autoridade é o Backend |
| Dados locais | Cache, metadados e operações ainda não sincronizadas no aparelho |

## Situação documental

A documentação descreve o produto solicitado, mas a implementação ainda não existe na branch base. Contrato da API, protótipos versionados e escolhas técnicas devem ser adicionados quando forem disponibilizados. As lacunas estão em [Decisões abertas](decisoes-abertas.md).
