# Orientações para trabalhar neste projeto

## Objetivo e comunicação

- Criar um tema genérico de documentação com a hierarquia Abas → Páginas → Títulos.
- Responder em português do Brasil, com linguagem simples e exemplos concretos.
- O mantenedor está aprendendo. Explicar o motivo das decisões e os conceitos relevantes.
- Apontar problemas e alternativas com fundamento; não concordar automaticamente.
- Trabalhar em mudanças pequenas, com resultado verificável. Não implementar todo o roadmap de uma vez.

## Antes de alterar

- Ler o README e os documentos relacionados à tarefa em `docs/`.
- Consultar `docs/DIAGNOSTICO.md` para a revisão inicial e `docs/PLANO-MVP.md` para prioridades.
- Distinguir código existente de propostas em `docs/ARQUITETURA.md`. A separação `examples/` e `site/` está implementada; URLs de títulos e o índice ainda estão pendentes.
- Conferir `git status` e preservar alterações do usuário.

## Arquitetura e código

- O projeto atual usa HTML, CSS, JavaScript com ES Modules e Web Components em Light DOM.
- `js/main.js` inicia o tema; `js/load-site.js` resolve e valida a configuração uma vez. Componentes recebem os dados, sem importar diretamente a configuração de uma instalação.
- Usar nomes minúsculos com hífen para módulos comuns e páginas; manter PascalCase nos arquivos que representam classes de componentes (`AppHeader.js`).
- O tema versiona exemplos em `examples/`. Nunca rastrear conteúdo da pasta local `site/` nem substituir seus arquivos em uma atualização.
- Preferir essa base para o MVP. Introduzir dependências somente quando resolvem uma necessidade concreta e explicar a escolha.
- A configuração deve definir abas, páginas e sua ordem; os títulos do HTML devem definir o índice da direita.
- Não cadastrar conteúdo real, assuntos de uma instalação ou categorias fixas nos componentes do tema.
- Manter identificadores de URL estáveis e validar rotas contra a configuração antes de buscar arquivos.
- Usar links reais para navegação; preservar teclado, abrir em nova aba e histórico do navegador.
- Usar `textContent` para rótulos e erros. A inserção de HTML é reservada a conteúdo de autoria confiável; conteúdo de editor futuro requer uma política de sanitização.
- Distinguir arquivo inexistente, falha de rede, acesso negado e configuração inválida.
- Nas mudanças de navegação, considerar requisições fora de ordem, configuração vazia e títulos repetidos.
- Seguir `biome.jsonc` para JavaScript e `.prettierrc` para HTML/CSS/Markdown, sem reformatar arquivos alheios à tarefa.

## Confidencialidade

- Este repositório é o tema genérico. Usar somente exemplos fictícios e públicos.
- Não colocar senhas, tokens, dados internos, URLs privadas ou documentos da empresa em código, commits, testes, logs ou prompts.
- Conteúdo de uma instalação deve ficar separado do tema, conforme a arquitetura proposta.
- `.gitignore` e bloqueio local de push não são controles de acesso ao site.
- Não implementar proteção de documentos apenas escondendo a interface com JavaScript.
- Integrações de autenticação da empresa pertencem ao ambiente autorizado e devem proteger também arquivos e anexos no servidor.

## Validação e entrega

- Não existe `package.json` nem comando `npm test`. Os testes nativos da separação são executados com Node.js 24: `node --test tests/load-site.test.mjs`.
- Servir por HTTP local para verificar o site; `file://` não é o fluxo de execução suportado.
- Para navegação: conferir link direto, recarregar, voltar/avançar, rota inválida, página ausente e clique rápido entre páginas.
- Para interface: conferir teclado, tela estreita e o fluxo afetado no navegador.
- Para documentação: conferir links locais, exemplos, caminhos e distinção entre entregue e planejado; usar `git diff --check`.
- Adicionar testes automatizados quando protegem comportamento importante, especialmente roteamento, títulos e atualização do tema.
- Atualizar `CHANGELOG.md` e o guia correspondente quando houver mudança de uso. Só marcar uma etapa do plano como concluída com evidência.
- Na entrega, explicar o que mudou, como foi verificado e as limitações restantes.
