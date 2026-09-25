# Benefícios — App Mobile

Aplicativo mobile corporativo que permite aos funcionários de uma empresa descobrir e utilizar benefícios em estabelecimentos parceiros próximos à sua localização.

---

## Sobre o projeto

O app funciona como uma central de benefícios corporativos geolocalizada. A pergunta central que ele responde é:

> *"Quais benefícios eu tenho perto de mim agora?"*

O funcionário abre o aplicativo, visualiza um mapa com os estabelecimentos próximos onde possui benefícios, navega por categorias, consulta os detalhes de cada loja e ainda tem acesso a um histórico de lojas que visitou — registrado automaticamente, sem nenhuma ação manual.

Desenvolvido em **React Native** como projeto acadêmico por uma equipe de 4 pessoas em 30 horas totais.

---

## Telas

| # | Tela | Descrição |
|---|------|-----------|
| 01 | Login | Autenticação com e-mail corporativo e senha |
| 02 | Landing | Mapa com estabelecimentos próximos + grade de categorias |
| 03 | Categoria | Mapa filtrado por categoria, com busca e ordenação |
| 04 | Loja | Detalhes do estabelecimento com benefício em destaque |
| 05 | Favoritos | Lista e mapa dos estabelecimentos favoritados |
| 06 | Mapa em tela cheia | Mapa expandido e navegável, mantendo o contexto da tela de origem |
| 07 | Lojas visitadas | Histórico automático de visitas com data, localização e benefício |

Protótipo visual disponível no [Figma](https://www.figma.com/design/fQtw5ogzbaQfkSDZHVeeRI) — página *App — Benefícios*.

---

## Funcionalidades

- Mapa interativo com pins de estabelecimentos próximos
- Filtro por categoria (Alimentação, Saúde, Moda, Lazer etc.)
- Busca por nome de estabelecimento
- Ordenação por proximidade e ordem alfabética
- Detalhes da loja: endereço, horário, produtos e benefício disponível
- Favoritar/desfavoritar estabelecimentos
- Histórico de lojas visitadas com detecção automática por geolocalização
- Botão "Como chegar" integrado a navegação externa

---

## Detecção automática de visitas

O sistema registra uma visita sem exigir nenhuma ação do usuário. A lógica é baseada em:

- Permanência mínima de **3 minutos** dentro da área do estabelecimento
- **Raio configurável** por estabelecimento (de 15 m a 60 m dependendo do porte)
- **Tolerância de GPS** para não cancelar sessões por oscilações normais
- Análise de **movimento, precisão e consistência** dos pontos coletados
- Identificação do **estabelecimento dominante** quando há raios sobrepostos
- **Altitude** como fator auxiliar para diferenciar andares

A decisão é binária: o usuário visitou ou não visitou. Não existe "visita provável".

---

## Estrutura do projeto

```
src/
├── screens/          # Telas do aplicativo
├── components/       # Componentes reutilizáveis (cards, mapa, busca etc.)
├── services/         # API, geolocalização e algoritmo de detecção de visitas
├── state/            # Gerenciamento de estado (usuário, favoritos, visitas)
├── navigation/       # Configuração de rotas
├── theme/            # Tokens de cor, tipografia e espaçamento
├── types/            # Tipos TypeScript globais
└── utils/            # Funções auxiliares (cálculos de distância, formatação)
```

---

## Design

A linguagem visual é corporativa, limpa e mobile-first. As principais referências são:

- **Azul** como cor principal (ações, ícones, elementos interativos)
- **Verde** reservado para benefícios e descontos
- Fundo cinza/azul muito claro, cards brancos
- Tipografia **Inter**
- Benefícios apresentados como badges/pills em destaque: `15% OFF`

---

## Tecnologias

- React Native + Expo
- TypeScript
- React Navigation
- Biblioteca de mapas e geolocalização a definir
- Lucide Icons (preferência para ícones)
