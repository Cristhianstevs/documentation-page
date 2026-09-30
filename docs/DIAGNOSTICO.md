# Diagnóstico inicial do projeto

Revisão em 2026-09-27. Base: commit local `ac23d27` (`Update page loads`), branch `main`, sem alterações locais no início da revisão. Este documento é um retrato dessa base, não uma lista automaticamente atualizada de defeitos. A separação de instalações e ajustes de navegação entregues em 2026-09-30 estão no [changelog](../CHANGELOG.md); os caminhos abaixo são os da base histórica.

## O que foi verificado

Foram lidos todos os arquivos de código, páginas, README e configurações de editor/formatação rastreados no repositório. Foram conferidos os arquivos referenciados pelo `config.js` e exercitados carregamento, troca de assunto, página ausente, link direto, recarregamento e retorno pelo navegador. O layout foi observado em 1280 × 720 e 390 × 844.

A execução usou um servidor HTTP temporário em `127.0.0.1:4173` e o navegador integrado. Não há backend, banco ou integração empresarial nesta base. Não foi feita auditoria de infraestrutura nem teste exaustivo em vários navegadores, leitor de tela ou rede lenta. A ausência de testes automatizados impede afirmar cobertura completa de regressões.

## O que já existe e vale aproveitar

| Área                          | Evidência                                       | Avaliação                                                  |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Conteúdo separado em arquivos | `pages/`                                        | Boa base para autoria em HTML                              |
| Navegação por dados           | `js/config.js`, `AppHeader.js`, `AppSidebar.js` | Cabeçalho e lateral já usam a mesma configuração           |
| Componentes reutilizáveis     | Custom Elements em Light DOM                    | Adequado ao tamanho atual, sem precisar de framework       |
| Carregamento de página        | `fetch` em `js/script.js`                       | Introdução e Instalação carregam por HTTP                  |
| Links diretos parciais        | `#guias/instalacao`                             | Funcionam no carregamento inicial e F5                     |
| Base de estilos               | `variables.css`, `core.css`                     | Variáveis de cores, fontes e espaçamentos já centralizadas |
| Ferramentas de edição         | Biome, Prettier e `.vscode/`                    | Há intenção de padronizar a escrita                        |

## Achados por prioridade

P1: impede uma função central ou o uso corporativo pretendido. P2: deve ser resolvido antes de considerar o MVP pronto. P3: melhoria de manutenção. Essas prioridades são deste projeto, não uma classificação de vulnerabilidade.

### P1 — Tema e conteúdo ainda disputam os mesmos arquivos

`js/config.js`, `pages/*.html` e `css/customization/custom.css` estão rastreados no Git do tema. Se cada instalação editar esses arquivos e o tema também os alterar, atualizações podem exigir mesclagem ou ser bloqueadas. A pasta de personalização, por si só, não cria isolamento.

**Próximo passo:** definir uma área local exclusiva da instalação e exemplos públicos separados. Ver [arquitetura](ARQUITETURA.md).

### P1 — Trocar de aba deixa a tela e o endereço inconsistentes

Em `js/script.js:51`, clicar no cabeçalho altera apenas as classes e a lateral. Não chama o carregador nem atualiza a URL.

**Reprodução confirmada:** abrir Instalação e clicar em Referência. A aba Referência fica ativa, a lateral mostra suas páginas, mas o centro continua em Instalação e o endereço permanece `#guias/instalacao`.

**Próximo passo:** toda navegação deve resolver uma rota completa e renderizar uma única seleção coerente.

### P1 — Voltar a um link inicial pode perder o conteúdo

Em `js/script.js:99`, o retorno depende de `event.state`. Uma entrada inicial aberta por URL pode não ter esse objeto.

**Reprodução confirmada:** abrir `#guias/introducao`, recarregar, clicar em Instalação e usar Voltar. O endereço volta a Introdução, mas o conteúdo vira a tela de boas-vindas.

**Próximo passo:** reconstruir a tela a partir da URL, inclusive no histórico, sem depender de estado previamente salvo por um clique.

### P1 — A base estática ainda não protege conteúdo corporativo

Não existe autenticação ou autorização no projeto. Um servidor estático comum entrega `pages/arquivo.html` diretamente, independentemente da interface. Uma tela de login isolada não corrige isso.

Esse é um bloqueio para a futura instalação confidencial, não um defeito em um tema público de demonstração. O controle deve ocorrer no servidor ou gateway que entrega páginas, configuração com metadados internos, PDFs, imagens e APIs. Ver o fluxo corporativo na [arquitetura](ARQUITETURA.md).

### P2 — Quatro das seis páginas cadastradas não têm conteúdo utilizável

| Arquivo cadastrado   | Resultado da inspeção  |
| -------------------- | ---------------------- |
| `introducao.html`    | Existe e tem conteúdo  |
| `instalacao.html`    | Existe e tem conteúdo  |
| `core-concepts.html` | Não existe             |
| `api-base.html`      | Não existe             |
| `colaboradores.html` | Existe, mas está vazio |
| `sobre.html`         | Existe, mas está vazio |

Clicar em Core Concepts mostrou o aviso de arquivo ausente. A URL continuou apontando para a página anterior porque o histórico só é salvo após sucesso. Arquivos vazios passam pelo teste `response.ok` e geram uma área central vazia.

**Próximo passo:** completar ou remover referências de exemplo e validar conteúdo vazio. O erro deve corresponder à rota solicitada.

### P2 — O índice à direita ainda é apenas um espaço reservado

Existe `<app-toc>` em `index.html:30`, mas não existe `AppToc.js`, registro do componente, extração de títulos, geração de IDs ou navegação por seção. O roteador lê somente dois segmentos do fragmento em `js/script.js:85`.

**Próximo passo:** construir o índice depois do carregamento do HTML e adicionar o terceiro segmento da rota.

### P2 — Os links não oferecem os destinos reais

`AppHeader.js:8` e `AppSidebar.js:18` geram `href="#"`. Abrir em nova aba ou copiar o endereço do link não aponta para o assunto/página.

**Próximo passo:** preencher o `href` com a rota real e preservar o comportamento normal de links, incluindo teclado e cliques com modificadores.

### P2 — A URL não é validada contra o catálogo

`checkUrlOnLoad()` transforma o segundo segmento diretamente em nome de arquivo. Não verifica se a aba existe nem se a página pertence a ela. A tela também depende de `guias` escrito diretamente em três pontos do script. `AppSidebar.js:5` assume que sempre há um primeiro item.

**Próximo passo:** validar a configuração e resolver a rota exclusivamente a partir dela. Configuração vazia deve produzir uma mensagem compreensível. A lista permitida de páginas organiza a navegação; ela não substitui autorização no servidor.

### P2 — Falta uma base de leitura e adaptação a telas pequenas

`css/content.css` está vazio. Classes usadas nas páginas, como `lead`, `info-box` e `code-block`, não têm os estilos esperados. Falta dimensionamento adequado do conteúdo central, espaço de leitura, tabelas e imagens responsivas.

**Observação confirmada em 390 px:** a lateral continua com 260 px, o conteúdo fica espremido/cortado e as ações do cabeçalho ficam fora da área visível. `overflow-x: hidden` oculta o excesso, mas não torna o layout responsivo.

**Próximo passo:** conteúdo central flexível, menus recolhíveis, foco visível e estilos semânticos. O índice pode usar `position: sticky` em telas largas e um controle expansível no celular.

### P2 — Carregamentos podem terminar fora de ordem

Pela leitura de `loadPage()`, não há cancelamento nem identificador da requisição atual. Uma resposta lenta de uma página anterior pode sobrescrever a última escolha.

Esse risco foi identificado no código; não foi reproduzido com rede artificialmente lenta nesta revisão. Implementar cancelamento ou descarte de respostas obsoletas e verificar o cenário.

### P2 — Tratamento de erro mistura causas diferentes

Todo erro no bloco de carregamento vira “Erro 404”, inclusive falha de rede ou exceção ao renderizar a interface. Na integração futura, 401/403 também não devem ser descritos como arquivo inexistente. A mensagem visual não muda o status HTTP do documento principal.

**Próximo passo:** estados explícitos de carregamento, vazio, não encontrado, acesso negado e falha de conexão. Usar `textContent` para mensagens e dados simples; a interpolação indiscriminada em `innerHTML` amplia o risco quando novas fontes de entrada forem adicionadas. Nenhum exploit foi demonstrado nesta revisão.

### P3 — Contratos e documentação precisam acompanhar o código

- Há dois `.content-container` aninhados: um criado pelo carregador e outro dentro das páginas existentes. Escolher um único responsável pelo contêiner.
- O `setTimeout(50)` para marcar a lateral é desnecessário para a renderização síncrona atual. Ele introduz atraso e mais uma possibilidade de estado obsoleto.
- Logo e título do documento são fixos. A configuração não controla toda a identidade do site.
- Botões de tema/configurações ainda não têm comportamento; a busca é apenas anunciada como futura.
- O README anterior citava pastas e rodapé ainda ausentes. O exemplo de clone na página Instalação usa `SeuUsuario`.
- `.vscode/` recomenda ESLint e Tailwind, embora não estejam implementados no projeto. Biome e Prettier têm funções separadas, o que pode ser mantido e explicado.
- Não há `package.json`, versões locais de ferramentas, suíte automatizada, CI, `.gitignore` nem arquivo de licença. Definir o que é necessário antes de distribuir o tema.
- A fonte depende de Google Fonts. Para ambiente sem acesso externo, prever fonte local ou a alternativa do sistema.

## Resultado da verificação

O fluxo básico de seleção e carregamento funciona, mas o MVP ainda não satisfaz URLs completas, índice de títulos, leitura móvel nem atualização isolada das instalações. A revisão não exige uma reescrita: os componentes existentes e a configuração podem ser aproveitados nas etapas do [plano](PLANO-MVP.md).
