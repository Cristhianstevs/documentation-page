# Etapa 3 — Escrita manual

Status em 2026-10-22: **concluída para páginas Markdown existentes**.

Esta etapa criou um estúdio local separado do leitor. Ele abre páginas cadastradas no `site.json`,
carrega Tiptap somente após a ação **Editar** e salva Markdown com validação, revisão otimista e
backup. Criar, remover ou reordenar abas e páginas pela interface continua sendo a Etapa 4.

## Começar com uma instalação nova

O comando abaixo cria `site/site.json` e `site/pages/inicio.md`. Ele recusa substituir uma pasta
`site/` existente:

```sh
npm run create-studio-site
npm run studio:dev
```

Abra `http://127.0.0.1:4176`. O servidor escuta somente `127.0.0.1` e não deve ser exposto à rede
sem autenticação e autorização no servidor.

Uma instalação HTML existente precisa ser migrada conscientemente. O conversor de página da Etapa 2
gera a prévia Markdown e um backup, mas não troca o catálogo automaticamente.

## Fluxo entregue

- seleção de uma página cadastrada e carregamento tardio do editor;
- edição visual de parágrafos, títulos, marcas, links, listas, tarefas, citação, divisor e código;
- barra de formatação, menu `/`, atalhos nativos de desfazer/refazer e `Ctrl+S`/`Cmd+S`;
- alternância entre **Visual**, **Markdown** e **Prévia**;
- aviso de alterações pendentes e confirmação antes de fechar ou trocar de página;
- rascunho versionado no `localStorage`, com ações explícitas para recuperar ou descartar;
- salvamento manual com limite de 2 MiB, validação do Markdown, backup em `.revisions/` e nova revisão;
- resposta `409` quando o arquivo mudou desde que a página foi aberta;
- interface responsiva e controles acessíveis por teclado.

Blocos v1 ainda não editáveis visualmente, como tabela, imagem, callout e toggle, abrem no modo
Markdown. O conteúdo não é simplificado nem descartado silenciosamente.

## Segurança do caminho e do salvamento

O navegador envia `pageId`, Markdown e a revisão aberta. O servidor encontra o caminho no
`site.json`; ele não aceita um caminho arbitrário do cliente. Antes de salvar, o repositório:

1. valida o tamanho e interpreta o Markdown no schema v1;
2. confere novamente a revisão SHA-256 do arquivo atual;
3. copia o conteúdo anterior para `.revisions/<pageId>/`;
4. grava um temporário exclusivo e o renomeia sobre o destino;
5. devolve a nova revisão e o caminho relativo do backup.

O estúdio é uma ferramenta local, não um controle de acesso para documentos privados.

## Como verificar

```sh
npm test
npm run studio:typecheck
npm run studio:build
npm run studio:test:browser
```

Os testes cobrem round-trip AST ↔ Tiptap, caminho cadastrado, backup, conflito sem sobrescrita,
edição/salvamento no Chromium, rascunho, fonte/prévia e largura móvel.

## Limites restantes

- criação e organização de abas/páginas pela interface entram na Etapa 4;
- tabelas, callouts, toggles e mídia visual entram na Etapa 5;
- o backup é recuperável como arquivo; uma interface para navegar revisões ainda não existe;
- não há colaboração simultânea, autenticação ou publicação automática;
- a compatibilidade visual com leitores de tela reais ainda exige teste humano.
