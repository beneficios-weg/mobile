# Componentes

Os componentes reutilizáveis são organizados por nível do Atomic Design:

- `atoms/`: elementos básicos e independentes, como `Input`, `PrimaryButton` e `CategoryButton`.
- `molecules/`: grupos pequenos de átomos que trabalham juntos, como um campo de busca com botão.
- `organisms/`: seções completas da interface, compostas por moléculas e átomos.

Crie cada pasta quando o primeiro componente daquele nível for adicionado. Templates e páginas representam layouts e telas da aplicação, então ficam fora desta biblioteca de componentes.

Os estilos dos componentes ficam em `src/components/style.css`, carregado uma vez em `src/main.ts`. Cada seção usa a classe raiz do componente para manter seus seletores isolados; ao criar um componente, adicione uma classe própria antes de incluir seu CSS nesse arquivo.
