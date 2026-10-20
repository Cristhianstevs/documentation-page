# Histórico de alterações

Registra entregas reais. O tema atual fica no [plano do MVP](docs/PLANO-MVP.md); a evolução ainda
não implementada fica no [plano da próxima versão](docs/PLANO-PROXIMA-VERSAO.md).

## Não lançado

### Fundação mensurável para a migração — 2026-10-20

- Criada uma instalação fictícia e pública para comparar o leitor atual com o futuro leitor Next.js.
- Adicionados testes para garantir abas, páginas e blocos essenciais dessa instalação.
- Registradas capturas reproduzíveis de desktop e celular, incluindo um problema já existente no menu móvel.
- Adicionado um medidor local de tamanho, velocidade e memória aproximada do leitor.
- Registrado o Lighthouse mobile reproduzível como ponto de partida da migração.
- Documentados o contrato de compatibilidade, o procedimento de recuperação e o aceite realizado em outra máquina.
- Confirmada a validação remota e encerrada a Etapa 0 com uma revisão recuperável pela tag `v0.1.0`.

### Arquitetura para editor e IA — 2026-10-20

- Registrada a arquitetura proposta para migrar o leitor para Next.js e TypeScript sem misturar a
  migração com o editor ou com a IA.
- Separados o leitor público exportável e o estúdio local de autoria, impedindo que editor, parsers e
  chaves façam parte do bundle público.
- Definidos Markdown e um AST do projeto como formato portátil, mantendo HTML atual por adaptador de
  compatibilidade durante a migração.
- Comparados Lexical, Tiptap, BlockNote e Plate; Lexical foi escolhido para o primeiro experimento,
  condicionado a testes de round-trip, acessibilidade e desempenho.
- Definido o fluxo de IA como `ChangeSet` validado, diff e aprovação humana, sem escrita direta pelo
  modelo e sem exclusão automática.
- Criado um plano em etapas para preservar o MVP, migrar o leitor, entregar escrita manual,
  configurações, blocos avançados, importação e, somente depois, IA.
- Detalhada a Etapa 0 com evidências, critérios de saída, arquitetura de pastas, responsabilidades e
  regras de dependência para uma migração reversível.

### Revisão final de experiência e documentação — 2026-10-14

- Adicionado `npm run create-site`, que cria uma instalação mínima e recusa sobrescrever `site/`.
- Adicionado `examples/starter/` com configuração, página inicial e CSS local prontos para editar.
- README, guia de uso, teste de aceite e demonstração foram reorganizados em passos curtos e na
  mesma ordem de aprendizado.
- A navegação da demonstração recebeu nomes mais diretos e todas as comparações com produtos
  externos foram removidas.
- O design ganhou fonte de leitura do sistema, hierarquia tipográfica maior, paleta com contraste,
  navegação mais clara e estados de interação consistentes.

### Navegação visual e exemplos — 2026-10-13

- A barra de rolagem passou a usar cores discretas do tema escuro.
- No desktop, menu de páginas e índice podem ser recolhidos e redimensionados por mouse ou teclado.
- O índice diferencia visualmente `h1`, `h2` e `h3`.
- Selecionar o `h1` volta ao topo; rolar manualmente atualiza a URL sem aumentar o histórico.
- Páginas com mais de um `h1` exibem um aviso claro.
- Blocos `pre > code` podem mostrar a linguagem com `data-language` ou `title`.
- Blocos de código ganharam um botão de copiar com retorno visual de sucesso.
- A página **Exemplos práticos** passou a reunir todos os padrões de conteúdo suportados, com
  resultado renderizado, orientação de acessibilidade e código copiável em cada exemplo.
- Listas com `task-list` ganharam checkboxes interativos e indicação visual de tarefa concluída.
- Blocos `details` ganharam aparência de toggle, foco visível e suporte visual a níveis aninhados.
- O visual global foi refinado com uma paleta neutra, hierarquia editorial, espaçamentos e componentes consistentes.
- No desktop, “Nesta página” fica ao lado do controle que recolhe todo o painel; somente o celular mantém a abertura compacta dos links.
- Tabelas passaram a ter legenda integrada, cabeçalho e rodapé visuais, linhas legíveis e rolagem própria acessível em telas estreitas.
- A demonstração foi reescrita como um guia simples e ganhou a página **Exemplos práticos**.

### Elementos HTML nativos — 2026-10-12

- Ampliados os estilos globais de conteúdo para títulos `h4`–`h6`, ênfases de texto, termos e definições, teclado/saída de terminal, mídia e partes de tabelas.
- Adicionado comportamento responsivo para listas de definição em telas estreitas.
- A instalação local de teste ganhou um catálogo temporário de elementos HTML; esse conteúdo continua fora da distribuição do tema.

### Documentação para validação externa — 2026-10-12

- README e guia de uso passaram a separar o caminho leve para experimentar do caminho completo para desenvolver e validar.
- Corrigidas instruções antigas sobre `package.json`, testes, índice e criação da pasta local `site/`.
- Adicionado um teste de aceite curto para a primeira pessoa que receber uma cópia do tema.
- Adicionado um teste automático para links locais dos documentos Markdown.
- Revisadas as páginas de exemplo para explicar IDs estáveis, instalação local, ferramentas de desenvolvimento e limites do MVP.
- Documentos históricos agora avisam claramente que não devem ser usados como tutorial atual.

### Preparação da versão 0.1.0 — 2026-10-09

- Adicionados comandos reproduzíveis para servidor local, formatação, testes e validação completa.
- Biome, Prettier e Playwright foram fixados como dependências de desenvolvimento; o site continua sem dependência de aplicação ou etapa de build.
- Criada uma matriz automatizada de navegador para desktop e celular, com link direto, F5, histórico, erros, concorrência de requisições e navegação móvel.
- Duas instalações fictícias passaram a validar atualização, preservação de conteúdo e CSS, backup e reversão.
- Adicionado workflow de CI para executar formatação, 35 testes nativos e os testes de navegador.
- Recomendações de Tailwind e ESLint foram removidas porque essas ferramentas não pertencem ao projeto.
- Títulos acessados pelo índice agora param no início de sua margem superior; no celular, o deslocamento também considera o índice fixo.
- Licença MIT e política SemVer `0.x` registradas. A tag/release `v0.1.0` ainda não foi publicada.

### Separação das instalações e organização — 2026-09-30

- Configuração, páginas de demonstração e CSS personalizado movidos para `examples/`.
- Instalações usam `site/config.js`, `site/pages/`, `site/assets/` e `site/custom.css`; a pasta `site/` é ignorada pelo Git do tema.
- `js/script.js` renomeado para `js/main.js`; novo `js/load-site.js` escolhe uma configuração compartilhada pelos componentes.
- Somente a ausência de `site/config.js` (HTTP 404) ativa a demonstração. Falhas de rede, acesso, sintaxe ou estrutura exibem erro.
- Nome do site, texto da marca e título lateral configuráveis; versão do tema separada da configuração de conteúdo.
- Navegação adaptada à fonte escolhida, sem dependência da aba `guias`. Links nativos mantêm os endereços existentes e o histórico; respostas antigas não substituem a página atual.
- Testes nativos para seleção da configuração, validação, caminhos em subpastas e isolamento do conteúdo no Git.
- Convenções de nomes e migração documentadas no guia de uso.

### Exemplos completos e instalação vazia — 2026-10-05

- A demonstração passou a ter todas as páginas cadastradas, com conteúdo fictício e sem contêineres de leitura duplicados.
- O guia passou a explicar o esqueleto local vazio de `site/`, com `config.js`, `pages/`, `assets/` e `custom.css`, para iniciar uma instalação sem copiar os exemplos.
- Páginas passaram a aceitar um `id` estável, independente do arquivo, mantendo compatibilidade com configurações antigas que possuem apenas `file`.
- O guia agora diferencia explicitamente os modos demonstração e instalação local; clones novos mostram `examples/` sem exigir renomeações.
- Um teste verifica que todas as páginas cadastradas na demonstração existem, possuem conteúdo e têm um título principal.

### Navegação completa e índice de títulos — 2026-10-07

- Leitura e resolução de URLs foram separadas da renderização e receberam testes unitários.
- Abrir o site sem fragmento ou entrar somente em uma aba agora seleciona sua primeira página válida e normaliza o endereço sem criar uma etapa extra no histórico.
- Conteúdo, menus ativos, título do navegador e foco agora seguem o mesmo resultado de rota.
- Estados de página vazia, arquivo ausente, acesso negado, erro do servidor e falha de rede passaram a ter mensagens distintas.
- Rotas inválidas oferecem um link real de recuperação; a navegação continua baseada em links nativos, preservando copiar endereço e abrir em nova aba.
- O índice lê `h1`, `h2` e `h3`, preserva a hierarquia e cria links reais para cada trecho.
- IDs automáticos tratam acentos, repetições, títulos vazios e colisões; IDs explícitos válidos são preservados.
- URLs aceitam o formato `#aba/pagina/titulo`, inclusive em link direto, F5 e histórico.
- Trocar somente de título não busca nem reconstrói o HTML; rolar manualmente atualiza apenas o destaque do índice.
- Um título solicitado que não existe mantém a página legível e mostra um aviso.
- Selecionar um título faz uma rolagem suave até alinhá-lo ao topo, com movimento imediato quando essa é a preferência de acessibilidade do sistema.

### Padrão visual, celular e acessibilidade — 2026-10-07

- `content.css` passou a definir tipografia, links, listas, citações, código, tabelas, imagens, legendas e detalhes expansíveis.
- Avisos de informação, atenção e perigo usam rótulo textual e ícone, sem comunicar significado somente pela cor.
- A demonstração ganhou o **Catálogo de estilos**, com referências locais verificadas por teste.
- A área de leitura recebeu largura confortável; tabelas e código largos usam rolagem própria e imagens são responsivas.
- Em telas estreitas, a lateral abre por um botão com estado acessível, fecha com `Esc` e o índice da página é recolhível.
- Foco visível e preferência por movimento reduzido passaram a fazer parte do padrão do tema.
- Os botões sem ação de configurações e tema foram removidos até que essas funções existam.
- Corrigido o destino dos links de título no celular: o título agora fica abaixo do índice fixo, sem ser encoberto.

A preparação da primeira release continua pendente. Esta entrada não representa uma release publicada.

### Documentação — 2026-09-27

- Revisão do código e verificação de navegação no navegador, com diagnóstico e prioridades.
- Plano de execução do MVP com dependências e critérios de aceite.
- Proposta de separação entre tema e instalações, contrato de URLs e processo de atualização.
- Guia de uso do código atual e orientação sobre Codex, VS Code e desenvolvimento com IA.
- Instruções de projeto em `AGENTS.md`.
- README reorganizado e notas anteriores preservadas em `docs/NOTAS-INICIAIS.md`.

Esta entrega altera documentação. O roteador, o índice de títulos, a separação de conteúdo e os estilos propostos ainda não foram implementados.

## Base existente na revisão

O código já continha cabeçalho e menu lateral gerados por configuração, carregamento de HTML e navegação parcial por fragmento de URL. O texto `1.0.0` em `appSettings` é um valor exibido pela interface; não foi tratado como evidência de uma versão publicada e validada.

## Como registrar próximas entregas

Em cada alteração, registrar comportamento, impacto e link para o guia de uso ou migração. Usar categorias como Adicionado, Corrigido e Alterado somente quando aplicáveis. Ao publicar uma versão, registrar sua data e identificação real; não preencher versões ou datas futuras como se já tivessem sido lançadas.
