# Componentes

Os componentes reutilizáveis são organizados por nível do Atomic Design:

- `atoms/`: elementos básicos e independentes, como `Input`, `PrimaryButton` e `FilterButton`.
- `molecules/`: grupos pequenos de átomos que trabalham juntos, como um campo de busca com botão e o `FilterDropdown` (botão com painel expansível de filtros).
- `organisms/`: seções completas da interface, compostas por moléculas e átomos.

Crie cada pasta quando o primeiro componente daquele nível for adicionado. Templates e páginas representam layouts e telas da aplicação, então ficam fora desta biblioteca de componentes.
