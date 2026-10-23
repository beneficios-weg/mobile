# Componentes

Os componentes reutilizáveis são organizados por nível do Atomic Design:

- `atoms/`: elementos básicos e independentes, como `Input`, `PrimaryButton`, `CategoryButton` e `ExpandButton`.
- `molecules/`: grupos pequenos de átomos que trabalham juntos, como um campo de busca com botão.
- `organisms/`: seções completas da interface, compostas por moléculas e átomos.

Crie cada pasta quando o primeiro componente daquele nível for adicionado. Templates e páginas representam layouts e telas da aplicação, então ficam fora desta biblioteca de componentes.

Os estilos ficam em `src/components/styles/`, em um arquivo por átomo ou componente de interface. `src/components/styles/index.css` importa cada folha e é carregado uma vez em `src/main.ts`. Mantenha os seletores sob a classe raiz do componente para evitar vazamento entre componentes.

`EstablishmentFacadeCard` recebe os campos de apresentação e a URL da fachada por props; a camada que consome a API deve mapear sua resposta para essas props. `facadeImageUrl` é opcional: quando disponível, o botão “Ver fachada” abre a imagem em um diálogo acessível.
