## Hierarquia de Pastas

```text
documentacao-staff/
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── assets/
│   ├── audio/
│   ├── font/
│   ├── img/
│   └── video/
├── css/
│   └── style.css
├── docs/
├── js/
│   ├── components/
│   └── script.js
├── pages/
│   ├── page01.html
│   ├── page02.html
│   └── ...
├── .prettierrc
├── biome.jsonc
├── favicon.ico
├── index.html
└── README.md
```

_`.vscode/`_: É a pasta de configurações do nosso projeto, nelas vão estar como o nosso VisualStudioCode deve se comportar no projeto sem causar conflito entre o meu e o seu.

_`assests/`_: Aqui vão ficar todos os arquivos que a página vai utilizar, fontes, videos, audios, imagens de background (diferente de imagens refetentes a nossa documentação, como a imagem de fluxo).

_`css/`_: Aqui vão ficar todos os arquivos de estilo da nossa página.

_`docs/`_: Aqui vão ficar os documentos que separamos da intranet, como o HTML, PDFs, Imagens referentes a documentação, e não à nossa página.

_`js/`_: Aqui vai ficar o coração do projeto, todos os componentes e funcionalidades como o _fatch/history API_ para carregar as páginas de forma dinâmica e sem repetir HTML.

_`pages/`_: Aqui vão ficar todos os arquivos HTML de cada "Pagina" da documentação separados por nomes, para facilitar a manutenção.

_`.prettierrc`_: Formatador de texto HTML.

_`.biome.jsonc`_: Nosso formatador global, vamos utilizar principalmente para o JavaScript (JS).

_`favicon.ico`_: O icone da página.

_`index.html`_: O nosso arquivo principal, onde tudo vai ficar centralizado.

_`README.md`_: Essa página! Onde estamos documentando o projeto.

## O que fizemos no HTML?

A Fonte: Puxamos a JetBrains Mono direto do Google Fonts.

Tags Inventadas: Colocamos `<app-header>` e `<app-sidebar>`. O navegador não sabe o que é isso ainda, ele vai ignorar por enquanto. É no JS que vamos dar vida a elas.

O Alvo (`<main id="main-content">`): Essa é a parte mais importante. O JavaScript do nosso roteador vai ter uma regra simples: toda vez que alguém clicar no menu, pegue o conteúdo da pasta pages/ e jogue exatamente dentro dessa tag `<main>`.

type="module": No script lá embaixo, adicionamos esse atributo. Ele é fundamental para o JavaScript moderno entender que vamos separar nosso código em vários arquivos pequenos na pasta components/ e importar tudo ali dentro.

## A Anatomia do Layout a 3 Colunas

`<div class="layout-wrapper">`: Esta é a "caixa" que vai segurar as três colunas lado a lado usando CSS Grid ou Flexbox.

`<app-toc>` (Table of Contents): Criamos um novo espaço para o Web Component que vai abrigar os links "Overview", "Usage Examples", etc., que ficam na lateral direita do seu Figma.

O Rodapé Interno: Em vez de um `<app-footer>` solto no final do HTML, colocamos a tag nativa `<footer>` dentro da `<main>`. Assim, quando o texto acabar, o usuário vê os links de navegação da documentação.

## Dissecando o Web Component

Para você explicar pro seu amigo com moral de sênior, a anatomia de um Web Component tem três partes fundamentais:

class ... extends HTMLElement: O JavaScript já tem uma "fábrica" de tags HTML embutida nele chamada HTMLElement. Quando dizemos extends, estamos falando: "Quero criar uma classe nova que herda todos os superpoderes de uma tag HTML comum (como ter IDs, classes, margens), mas eu vou ditar as regras dela."

connectedCallback() (O Ciclo de Vida):
Esse é um método mágico. Você não precisa chamar essa função em lugar nenhum. O navegador fica vigiando o seu HTML; no exato milissegundo em que ele lê a tag `<app-header>` lá no index.html, ele dispara essa função. Dentro dela, usamos o this.innerHTML para cuspir todo aquele bloco de HTML clássico na tela.

customElements.define() (O Dicionário):
De nada adianta criar a classe se o navegador não souber que ela existe. Essa última linha é você atualizando o dicionário interno do Google Chrome/Edge. Uma regra de ouro da web: toda tag customizada obrigatoriamente precisa ter um traço no nome (por isso app-header, e não appheader). Isso serve para o navegador nunca confundir a sua tag com uma tag oficial do HTML que possa ser lançada no futuro.

Nota de Arquitetura: Nós usamos uma técnica aqui chamada "Light DOM" (inserir HTML direto via this.innerHTML). Em tutoriais complexos, você vai ver o pessoal usando Shadow DOM. O Shadow DOM cria um "escudo" em volta do componente que impede o CSS de fora de entrar nele. Mas como queremos usar o nosso style.css global de forma simples, o Light DOM é a escolha perfeita e mais fácil!
