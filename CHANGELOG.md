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

Índice de títulos, links de trechos e novo layout continuam pendentes. Os exemplos ausentes/vazios da revisão inicial ainda precisam ser completados. Esta entrada não representa uma release publicada.

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
