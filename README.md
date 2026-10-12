# Documentação Page

Tema genérico para centralizar documentação, wikis e anotações com a organização **Abas → Páginas → Títulos**.

A proposta é usar o mesmo tema em instalações diferentes, como uma base de conhecimento de equipe e uma wiki pessoal. Cada instalação terá seu conteúdo e poderá adotar melhorias do tema.

## O que este projeto faz

Este projeto é um tema estático para documentação. A pessoa cria abas, cadastra páginas e escreve títulos. O tema monta automaticamente a navegação no formato **Abas → Páginas → Títulos**.

Ele é feito com HTML, CSS e JavaScript puro. Não há backend, banco de dados nem etapa de build. Os pacotes do `node_modules` servem apenas para desenvolvimento e testes; eles não são enviados ao navegador nem precisam ser publicados com o site.

O tema carrega `site/config.js` e `site/pages/` quando há uma instalação local. Na ausência de `site/config.js`, usa `examples/`. Cabeçalho e lateral recebem a mesma configuração. Links de página como `#guias/instalacao` são preservados.

O índice automático, os links de trechos, o catálogo de estilos e a navegação para celular estão implementados. A versão `0.1.0` está pronta para o teste independente que antecede a primeira publicação. O [diagnóstico inicial](docs/DIAGNOSTICO.md) registra como o projeto começou; o [changelog](CHANGELOG.md) registra o que foi entregue depois.

Esta base estática ainda não oferece controle de acesso para documentos confidenciais.

## Experimentar sem instalar dependências

1. Instalar o Node.js 24.
2. Executar `node tools/serve.mjs`.
3. Abrir `http://127.0.0.1:4173`.

Esse caminho não cria `node_modules`. Sem `site/config.js`, a demonstração de `examples/` aparece automaticamente.

## Criar sua documentação

1. Copiar `examples/` para uma nova pasta `site/` ou criar `site/` do zero.
2. Editar `site/config.js` para definir o nome, as abas e as páginas.
3. Criar os textos em `site/pages/`.
4. Recarregar o navegador.

O passo a passo completo está no [guia de uso](docs/GUIA-DE-USO.md).

## Desenvolver e validar o tema

Quem vai alterar o tema deve instalar as ferramentas fixadas:

```sh
npm ci
npx playwright install chromium
npm run validate
```

Não usar `file://`: os módulos e as páginas precisam ser carregados por HTTP.

## Documentação

| Quero…                                          | Documento                                                |
| ----------------------------------------------- | -------------------------------------------------------- |
| Entender o que funciona e o que falta           | [Diagnóstico](docs/DIAGNOSTICO.md)                       |
| Seguir as próximas entregas do MVP              | [Plano do MVP](docs/PLANO-MVP.md)                        |
| Entender URLs, tema, instalações e atualizações | [Arquitetura](docs/ARQUITETURA.md)                       |
| Criar páginas e adotar mudanças                 | [Guia de uso](docs/GUIA-DE-USO.md)                       |
| Aprender a trabalhar com Codex no VS Code       | [Desenvolvimento com IA](docs/DESENVOLVIMENTO-COM-IA.md) |
| Conferir o que foi entregue                     | [Changelog](CHANGELOG.md)                                |
| Consultar as evidências da validação            | [Relatório do MVP](docs/RELATORIO-VALIDACAO-MVP.md)      |
| Testar uma cópia como novo usuário              | [Teste de aceite](docs/TESTE-DE-ACEITE.md)               |
| Consultar instruções para o agente              | [AGENTS.md](AGENTS.md)                                   |
| Rever as anotações do README anterior           | [Notas iniciais](docs/NOTAS-INICIAIS.md)                 |

## Estrutura atual

```text
documentacao-page/
├── .vscode/                    # preferências e recomendações de editor
├── css/
│   ├── variables.css           # cores, fontes e espaçamentos
│   ├── core.css                # estrutura do layout
│   └── content.css             # estilos públicos do conteúdo
├── js/
│   ├── components/
│   │   ├── AppHeader.js
│   │   ├── AppSidebar.js
│   │   └── AppToc.js
│   ├── load-site.js            # seleção e validação da configuração
│   └── main.js                 # inicialização e navegação
├── examples/                   # demonstração versionada pelo tema
│   ├── config.js
│   ├── pages/
│   ├── assets/
│   └── custom.css
├── site/                       # cópia local, criada pelo usuário e ignorada pelo Git
│   ├── config.js
│   ├── pages/
│   ├── assets/
│   └── custom.css
├── tests/                       # testes nativos, de navegador e instalações fictícias
├── tools/                       # servidor HTTP local
├── docs/                       # documentação do desenvolvimento do tema
├── .gitattributes
├── .gitignore
├── .prettierrc
├── biome.jsonc
├── package.json                 # comandos e ferramentas fixadas
├── playwright.config.mjs       # matriz de navegador
├── favicon.ico
├── index.html
├── AGENTS.md
├── CHANGELOG.md
└── README.md
```

A pasta `site/` não é distribuída pelo Git do tema e precisa de backup próprio. `docs/` contém os manuais do projeto; não deve receber documentos internos de uma instalação. As convenções de nomes e a migração dos caminhos antigos estão no [guia de uso](docs/GUIA-DE-USO.md).

## Reutilização e colaboração

Configuração, páginas e CSS próprios ficam em `site/`. Os arquivos fora dessa pasta pertencem ao tema ou às suas ferramentas e documentação. Alterá-los não atualiza outros sites imediatamente: cada cópia precisa receber e validar a atualização. Para cópias antigas com conteúdo nos caminhos anteriores, fazer backup e seguir a migração antes de atualizar.

O tema deve conter apenas exemplos públicos/fictícios. Autenticação empresarial, documentos internos e backups pertencem ao ambiente autorizado da empresa. Uma tela de login no navegador não protege, sozinha, arquivos servidos publicamente.

Trabalhar com mudanças pequenas, critérios de aceite e verificações reproduzíveis. O roadmap contém propostas; o changelog registra entregas. O código e os exemplos usam a licença MIT; versões seguem SemVer durante a fase `0.x`.
