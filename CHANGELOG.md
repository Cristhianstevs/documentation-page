# Histórico de alterações

Registra entregas reais. Trabalho futuro fica no [plano do MVP](docs/PLANO-MVP.md).

## Não lançado

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

Catálogo visual, adaptação completa ao celular e primeira release continuam pendentes. Esta entrada não representa uma release publicada.

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
