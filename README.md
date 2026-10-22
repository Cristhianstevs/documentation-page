# Documentation Page

Tema estático para criar documentação com a estrutura **Abas → Páginas → Títulos**.

Você escreve arquivos HTML simples. O tema cria os menus, o índice da página, os links diretos e o
layout para desktop e celular.

> **Estado do projeto:** a versão estática `0.1.0` continua sendo o produto funcional. A Etapa 1 da
> migração concluiu a equivalência funcional do leitor Next.js em `apps/reader`; ele ainda não substitui o
> tema atual. A Etapa 2 definiu Markdown/AST e escolheu Tiptap; a Etapa 3 entregou edição e salvamento
> local de páginas Markdown em `apps/studio`. Configurações pela interface e IA continuam planejadas. Leia a
> [arquitetura proposta](docs/ARQUITETURA.md) e o
> [plano incremental](docs/PLANO-PROXIMA-VERSAO.md). Nenhum desses recursos futuros está disponível
> nesta revisão.

## Começo rápido

### 1. Instale o necessário

Use o [Node.js 24](https://nodejs.org/) ou uma versão mais recente.

### 2. Crie sua pasta de conteúdo

Abra um terminal na pasta do projeto e execute:

```sh
npm run create-site
```

O comando cria uma instalação mínima dentro de `site/`. Ele não substitui uma pasta `site/`
existente.

### 3. Abra o site

```sh
npm start
```

Abra `http://127.0.0.1:4173` no navegador.

### 4. Edite sua primeira página

Abra `site/pages/inicio.html`, troque o texto, salve e recarregue o navegador.

Pronto. Você já tem uma documentação local.

## Estrutura que você edita

```text
site/
├── config.js       # nome do site, abas, páginas e ordem dos menus
├── custom.css      # cores e ajustes visuais desta instalação
├── assets/         # imagens, PDFs e outros arquivos
└── pages/
    └── inicio.html # conteúdo de uma página
```

| Para fazer isto                   | Edite isto             |
| --------------------------------- | ---------------------- |
| Mudar o nome do site              | `site/config.js`       |
| Criar abas e itens do menu        | `site/config.js`       |
| Escrever ou alterar uma página    | `site/pages/nome.html` |
| Adicionar uma imagem ou um PDF    | `site/assets/`         |
| Personalizar cores e espaçamentos | `site/custom.css`      |

## Exemplo de uma página

Uma página é um fragmento HTML. Não inclua `html`, `head`, `body`, CSS ou JavaScript.

```html
<h1>Primeiros passos</h1>
<p class="lead">Resumo curto da página.</p>

<h2 id="preparar">Preparar</h2>
<p>Explique o que a pessoa precisa fazer.</p>

<h2 id="executar">Executar</h2>
<ol>
  <li>Faça a primeira ação.</li>
  <li>Confira o resultado.</li>
</ol>
```

Use um único `h1`. Os títulos `h1`, `h2` e `h3` formam automaticamente o índice da direita.

## Aprender com a demonstração

Se `site/config.js` não existir, o tema abre a demonstração da pasta `examples/`.

Nela você encontra:

- um tutorial para criar `site/`;
- a configuração completa de abas e páginas;
- exemplos copiáveis de todos os componentes de conteúdo;
- um catálogo visual;
- orientações para atualizar e revisar documentos.

## Arquivos do tema e arquivos do usuário

- `site/` contém seu conteúdo local.
- `examples/` contém a demonstração pública.
- `css/` e `js/` contêm o tema.
- `docs/` contém os manuais do projeto.

A pasta `site/` é ignorada pelo Git deste tema. Faça backup dela. Essa regra evita commits comuns,
mas não protege arquivos publicados na internet.

## Conteúdo privado

Este projeto não possui login nem controle de acesso. Não publique documentos privados em um
servidor público. Uma instalação privada precisa proteger também o acesso direto a páginas, imagens
e anexos no servidor.

## Validar uma alteração no tema

As dependências existem somente para desenvolvimento e testes:

```sh
npm ci
npx playwright install chromium
npm run validate
```

Não abra o projeto com `file://`. Use sempre `npm start` ou `node tools/serve.mjs`.

## Experimentar o estúdio Markdown

Para criar uma instalação v1 nova e abrir o editor local:

```sh
npm run create-studio-site
npm run studio:dev
```

Abra `http://127.0.0.1:4176`. O comando de criação não substitui uma pasta `site/` existente. O
estúdio edita somente páginas Markdown cadastradas no `site.json`; páginas HTML precisam passar pelo
conversor explícito da Etapa 2.

## Documentação

| Você quer…                                   | Leia                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| Aprender todo o fluxo                        | [Guia de uso](docs/GUIA-DE-USO.md)                           |
| Entender a arquitetura futura                | [Arquitetura](docs/ARQUITETURA.md)                           |
| Conferir o estado do MVP                     | [Plano do MVP](docs/PLANO-MVP.md)                            |
| Conhecer a evolução para editor e IA         | [Plano da próxima versão](docs/PLANO-PROXIMA-VERSAO.md)      |
| Entender a Etapa 0 e a nova estrutura        | [Fundação da migração](docs/ETAPA-0-FUNDACAO.md)             |
| Acompanhar a migração do leitor              | [Etapa 1 — Leitor](docs/ETAPA-1-LEITOR.md)                   |
| Entender o formato e o experimento do editor | [Etapa 2 — Formato e editor](docs/ETAPA-2-FORMATO-EDITOR.md) |
| Usar o editor e o salvamento local           | [Etapa 3 — Escrita manual](docs/ETAPA-3-ESCRITA-MANUAL.md)   |
| Comparar as tecnologias pesquisadas          | [Pesquisa de tecnologias](docs/PESQUISA-TECNOLOGIAS.md)      |
| Testar uma instalação como novo usuário      | [Teste de aceite](docs/TESTE-DE-ACEITE.md)                   |
| Ver o que já foi validado                    | [Relatório de validação](docs/RELATORIO-VALIDACAO-MVP.md)    |
| Consultar as mudanças                        | [Changelog](CHANGELOG.md)                                    |

O projeto usa a licença MIT.
