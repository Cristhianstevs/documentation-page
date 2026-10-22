# Etapa 2 — Formato de conteúdo e experimento do editor

Status em 2026-10-22: **concluída**.

Esta etapa definiu o formato portátil do projeto e comparou Lexical e Tiptap em uma bancada isolada. Ela não
entrega salvamento pela interface nem transforma o laboratório em produto. Essas funções pertencem
à Etapa 3.

## Contratos v1

`site.json` possui `schemaVersion: 1`, identidade do site, abas ordenadas e um mapa de páginas. IDs
usam letras minúsculas, números e hífen. Fontes ficam dentro de `pages/` e podem ser `.md` ou `.html`
durante a migração. O schema rejeita páginas ausentes, repetidas ou fora das abas.

O AST v1 aceita:

- parágrafo, títulos `h1`–`h3`, citação, listas e tarefas;
- texto com negrito, itálico, sublinhado, tachado e código;
- links, bloco de código, tabela, divisor e imagem;
- diretivas `callout` e `toggle`.

Markdown usa CommonMark, GFM e duas diretivas documentadas:

```md
:::callout{tone=warning title="Atenção"}
Revise antes de publicar.
:::

:::toggle{title="Mais detalhes"}
Conteúdo recolhível.
:::
```

Sublinhado usa `:u[texto]`. HTML cru não é interpretado como conteúdo confiável pelo parser
Markdown.

## Compatibilidade com HTML

O adaptador legado produz o AST junto do HTML atual, sem reescrever nenhum arquivo. Elementos ativos,
como `script`, `style` e `iframe`, são descartados pelo caminho de conversão. Elementos sem
representação v1 geram avisos em vez de desaparecer silenciosamente.

O comando abaixo mostra uma prévia e não grava nada:

```bash
npm run convert:legacy-page -- --source site/pages/inicio.html --target site/pages/inicio.md
```

Para aplicar conscientemente:

```bash
npm run convert:legacy-page -- --source site/pages/inicio.html --target site/pages/inicio.md --apply
```

O modo `--apply` recusa sobrescrever o Markdown, copia o HTML original para `.revisions/` e informa
quantidade de blocos, títulos e simplificações. O catálogo não é alterado automaticamente; a pessoa
revisa a prévia antes de trocar a fonte da página.

## Experimento comparativo

`apps/editor-lab` é uma bancada separada. Os protótipos cobrem parágrafo, título, marcas, lista e
código, com desfazer/refazer e teclado real no Chromium. O pacote `packages/editor` preserva o
adaptador Lexical usado para provar o round-trip; Tiptap foi adicionado somente à bancada de
comparação. O leitor não possui dependência de nenhum editor.

Resultados observados nesta máquina:

- round-trip de 5.000 parágrafos em teste de domínio abaixo do limite de 5 segundos;
- Lexical carregou 5.000 blocos em 109 ms, mas uma rodada anterior não concluiu `Ctrl+End` em 30
  segundos; a rodada final completa levou 29,6 segundos;
- Tiptap carregou os mesmos blocos em 50 ms e concluiu o cenário completo em 4,7 segundos;
- após posicionamento direto equivalente, as medianas de p95 foram 14,70 ms no Lexical e 14,90 ms
  no Tiptap, ambas abaixo do orçamento de 50 ms;
- desfazer e refazer aprovados por teste de teclado;
- Markdown → AST → Lexical → AST preserva o subconjunto suportado;
- Markdown → AST → Markdown preserva o documento v1 testado.

O gatilho para comparar Tiptap foi acionado pela instabilidade do Lexical no documento grande. Tiptap
foi escolhido para a Etapa 3 porque completou o fluxo de maneira mais estável. O AST continua
independente do editor, portanto a decisão pode ser revista com evidência sem migrar os documentos.

## Como verificar

```bash
npm test
npm run editor-lab:typecheck
npm run editor-lab:build
npm run editor-lab:test:browser
```

## Limites restantes

- o laboratório não abre nem salva arquivos reais;
- o adaptador produtivo AST ↔ Tiptap será criado junto da entrega manual da Etapa 3;
- tabela, callout, toggle e imagem são suportados pelo formato e pelo renderizador, mas não pelo
  protótipo comparativo;
- conversões legadas podem simplificar componentes visuais e sempre exigem revisão humana;
- o custo de JavaScript do leitor, registrado na Etapa 1, continua sendo uma ressalva.

O próximo incremento é a Etapa 3: criar o estúdio local e entregar edição manual com salvamento
atômico, rascunho e conflitos, reutilizando estes contratos.
