# Documentação Page

Tema genérico para centralizar documentação, wikis e anotações com a organização **Abas → Páginas → Títulos**.

A proposta é usar o mesmo tema em instalações diferentes, como uma base de conhecimento de equipe e uma wiki pessoal. Cada instalação terá seu conteúdo e poderá adotar melhorias do tema.

## Estado atual

Projeto em desenvolvimento, feito com HTML, CSS e JavaScript puro, usando ES Modules e Web Components em Light DOM. Não há backend, banco de dados, build ou dependências de aplicação configurados.

O tema carrega `site/config.js` e `site/pages/` quando há uma instalação local. Na ausência de `site/config.js`, usa `examples/`. Cabeçalho e lateral recebem a mesma configuração. Links de página como `#guias/instalacao` são preservados.

O índice de títulos à direita, os links de trechos, o catálogo de estilos e a adaptação completa ao celular ainda precisam ser implementados. Há referências de exemplo a arquivos ausentes e páginas vazias. O [diagnóstico inicial](docs/DIAGNOSTICO.md) registra a base histórica; o [changelog](CHANGELOG.md) registra as entregas posteriores.

Esta base estática ainda não oferece controle de acesso para documentos confidenciais.

## Começar

1. Abrir a pasta do projeto no VS Code.
2. Servir a pasta por HTTP local, por exemplo com Live Server no `index.html`.
3. Abrir o endereço informado pelo servidor e selecionar uma página na lateral.
4. Para criar uma instalação, copiar `examples/` para uma nova pasta `site/`, se ela ainda não existir.
5. Editar `site/config.js` e `site/pages/`, seguindo o [guia de uso](docs/GUIA-DE-USO.md).

Não usar `file://`: módulos e carregamento de páginas devem ser executados em um servidor HTTP. Não existem comandos `npm start` ou `npm test`. Com Node.js 24 ativo, os testes da separação são executados por `node --test tests/load-site.test.mjs`.

## Documentação

| Quero…                                          | Documento                                                |
| ----------------------------------------------- | -------------------------------------------------------- |
| Entender o que funciona e o que falta           | [Diagnóstico](docs/DIAGNOSTICO.md)                       |
| Seguir as próximas entregas do MVP              | [Plano do MVP](docs/PLANO-MVP.md)                        |
| Entender URLs, tema, instalações e atualizações | [Arquitetura](docs/ARQUITETURA.md)                       |
| Criar páginas e adotar mudanças                 | [Guia de uso](docs/GUIA-DE-USO.md)                       |
| Aprender a trabalhar com Codex no VS Code       | [Desenvolvimento com IA](docs/DESENVOLVIMENTO-COM-IA.md) |
| Conferir o que foi entregue                     | [Changelog](CHANGELOG.md)                                |
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
├── tests/load-site.test.mjs     # testes nativos, sem dependências
├── docs/                       # documentação do desenvolvimento do tema
├── .gitattributes
├── .gitignore
├── .prettierrc
├── biome.jsonc
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

Trabalhar com mudanças pequenas, critérios de aceite e verificações reproduzíveis. O roadmap contém propostas; o changelog registra entregas. A escolha de licença está pendente antes da primeira distribuição formal.
