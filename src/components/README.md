# Componentes

Os componentes reutilizáveis são organizados por nível do Atomic Design:

- `atoms/`: elementos básicos e independentes, como `Input`, `PrimaryButton`, `CategoryButton` e `ExpandButton`.
- `molecules/`: grupos pequenos de átomos que trabalham juntos, como um campo de busca com botão.
- `organisms/`: seções completas da interface, compostas por moléculas e átomos.

Crie cada pasta quando o primeiro componente daquele nível for adicionado. Templates e páginas representam layouts e telas da aplicação, então ficam fora desta biblioteca de componentes.

Os estilos ficam em `src/components/styles/`, em um arquivo por átomo ou componente de interface. `src/components/styles/index.css` importa cada folha e é carregado uma vez em `src/main.ts`. Mantenha os seletores sob a classe raiz do componente para evitar vazamento entre componentes.

`EstablishmentFacadeCard` recebe os campos de apresentação e a URL da fachada por props; a camada que consome a API deve mapear sua resposta para essas props. `facadeImageUrl` é opcional: quando disponível, o botão “Ver fachada” abre a imagem em um diálogo acessível.

`AboutUnitCard` apresenta a descrição completa da unidade em largura total. `ExpandableAboutUnitCard` recebe título, descrição, estado expandido e callback; o pai controla qual card fica aberto e oculta os irmãos sem removê-los do layout. Os dois componentes são somente de apresentação e recebem conteúdo por props.

`BenefitCard` usa `benefitDescriptionMotion`, em `src/lib/benefitDescriptionMotion.ts`, para mover a própria descrição entre as posições compacta e expandida enquanto a linha muda de altura. `ExpandableAboutUnitCard` usa `aboutUnitExpansion`, em `src/lib/aboutUnitExpansion.ts`, para expandir a largura e a altura em um movimento contínuo, mantendo o texto visível e as quebras de linha estáveis durante o movimento. Seu slot preserva a altura recolhida. O pai deve liberar o retorno dos outros cards assim que o recolhimento começar. O pai deve ocultar os irmãos com `.about-unit-card-visibility.is-hidden`, `inert` e `aria-hidden`, mantendo seus espaços, e marcar a região disponível com `data-about-unit-area`. Textos maiores que essa região recebem rolagem interna. As transições respeitam a preferência de movimento reduzido.

O modo opcional `expansionMode="content"` mantém a expansão lateral existente e permite aumentar a altura até mostrar a descrição completa, sem rolagem interna. O slot acompanha essa altura no fluxo da página. O pai mantém o mesmo comportamento de ocultar os vizinhos durante a expansão. A página de Informações do Estabelecimento usa essa opção somente em Sobre a unidade. O padrão `area` preserva o comportamento descrito acima nos demais usos.
