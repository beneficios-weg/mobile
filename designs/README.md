# Designs

## Referência conhecida

Uma branch documental remota do repositório aponta para o Figma [App — Benefícios](https://www.figma.com/design/fQtw5ogzbaQfkSDZHVeeRI), página “App — Benefícios”. O acesso, a versão e a correspondência com os requisitos atuais não foram validados durante esta consolidação.

Nenhum arquivo de design, export, imagem ou token foi encontrado na branch base. Para a implementação de Favoritos, o solicitante forneceu quatro imagens de referência: celular e tablet em retrato e paisagem. A entrega recebeu aprovação visual, e essas quatro imagens temporárias foram removidas conforme solicitado. As dimensões e decisões visuais estão registradas em [Componentes de UI](../docs/componentes-ui.md).

## Uso pelos desenvolvedores

- confirmar com Design/Produto que o link e a página são a fonte vigente;
- não inferir telas ou elementos que não estejam nos requisitos ou protótipos;
- registrar divergências entre protótipo, documentação e implementação;
- manter a tipografia de sistema da página de categorias (`-apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif`) e Lucide Icons; a indicação anterior de Inter foi corrigida pelo solicitante em 2026-10-21;
- confirmar detalhes visuais que não estejam claros, sem inventar fontes ou substituir o padrão;
- transformar cores, tipografia e espaçamentos aprovados em tokens do projeto quando o código existir;
- evitar duplicar assets que já estejam disponíveis em formato adequado.

## Checklist de validação

- sete telas e fluxos auxiliares identificáveis;
- mapa e pins com estados normal, selecionado, vazio e erro;
- Floating Tab Bar com destinos e ordem definidos;
- estados de loading, vazio, erro, offline e permissão negada;
- comportamento de favoritos independente de visitas;
- benefício principal do MVP claramente destacado;
- acessibilidade e áreas seguras de Android/iOS;
- assets com licença e resolução apropriadas.

## DECISÃO PENDENTE

Confirmar a fonte visual oficial, os tokens, os assets exportáveis e a versão a ser usada pela implementação.
