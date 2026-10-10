# Documentação Page

Tema genérico para centralizar documentação, wikis e anotações com a organização **Abas → Páginas → Títulos**.

A proposta é usar o mesmo tema em instalações diferentes, como uma base de conhecimento de equipe e uma wiki pessoal. Cada instalação terá seu conteúdo e poderá adotar melhorias do tema.

## Estado atual

Projeto em desenvolvimento, feito com HTML, CSS e JavaScript puro, usando ES Modules e Web Components em Light DOM. Não há backend, banco de dados nem etapa de build. As dependências instaladas são somente ferramentas de desenvolvimento e não são enviadas ao navegador.

O tema carrega `site/config.js` e `site/pages/` quando há uma instalação local. Na ausência de `site/config.js`, usa `examples/`. Cabeçalho e lateral recebem a mesma configuração. Links de página como `#guias/instalacao` são preservados.

O índice automático, os links de trechos, o catálogo de estilos e a navegação adaptada ao celular estão implementados. O [diagnóstico inicial](docs/DIAGNOSTICO.md) registra a base histórica; o [changelog](CHANGELOG.md) registra as entregas posteriores.

Esta base estática ainda não oferece controle de acesso para documentos confidenciais.

## Começar

1. Instalar o Node.js 24.
2. Executar `npm ci` para instalar as versões fixadas das ferramentas.
3. Executar `npm start` e abrir `http://127.0.0.1:4173`.
4. Sem `site/config.js`, a demonstração de `examples/` aparece automaticamente.
5. Para criar uma instalação, criar `site/config.js` e páginas em `site/pages/`, seguindo o [guia de uso](docs/GUIA-DE-USO.md).
6. Se preferir partir de uma base preenchida, copiar `examples/` para uma nova pasta `site/`.

Não usar `file://`: módulos e carregamento de páginas devem ser executados por HTTP. `npm test` executa os testes nativos; `npm run test:browser` executa os fluxos no Chromium; `npm run validate` reúne formatação, testes e `git diff --check`.

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
| Consultar instruções para o agente              | [AGENTS.md](AGENTS.md)                                   |
| Rever as anotações do README anterior           | [Notas iniciais](docs/NOTAS-INICIAIS.md)                 |

## Estrutura atual

```text
documentacao-page/
├── .vscode/                    # preferências e recomendações de editor
├── css/
│   ├── variables.css           # cores, fontes e espaçamentos
│   ├── core.css                # estrutura do layout
│   └── content.css             # reservado para estilos de conteúdo
├── js/
│   ├── components/
│   │   ├── AppHeader.js
│   │   └── AppSidebar.js
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
