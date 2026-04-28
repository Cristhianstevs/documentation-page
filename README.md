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

## config.js

A estrutura de Array `[ ]` e Objetos `{ }`
Criamos uma lista (array) onde cada bloco representa um botão principal do nosso Header.

`id`: É o identificador único dessa seção, escrito sempre em letras minúsculas e sem espaços. Ele é o coração da nossa lógica. Quando o usuário clicar em "Guias", o nosso garçom vai procurar pelo ID `guias` para saber o que mostrar na Sidebar.

`title`: É o texto bonitinho que vai aparecer escrito na tela para o usuário ler.

`pages`: É uma sub-lista contendo todas as páginas daquela categoria. Cada página tem o título que vai aparecer na Sidebar e o nome exato do arquivo HTML que deve ser buscado pelo Fetch na pasta pages/.

## AppHeader

O que estamos fazendo aqui?
import { docsConfig } from '../config.js';
Aqui nós saímos da pasta components/ (voltando um nível com o ../) e fomos buscar a nossa Fonte da Verdade. Agora o Header tem acesso a toda aquela lista que criamos no passo anterior.

O Método .map() e .join('')
Em vez de digitar vários <a href="..."> na mão, nós usamos a função map(). O JavaScript pega a nossa lista (docsConfig) e percorre item por item. Para cada bloco (Guias, Referência, Comunidade), ele cospe uma tag <a> preenchida com o nome correto.
O .join('') no final serve apenas para colar todas essas tags HTML umas nas outras como se fossem um texto só, tirando as vírgulas invisíveis que o JavaScript coloca nas listas.

const isActive = index === 0 ? 'active' : '';
Isso é uma pequena malícia visual. Como queremos que a primeira aba (Guias) venha selecionada por padrão quando o usuário abre o site, verificamos se é o primeiro item da lista (index === 0). Se for, colocamos a classe CSS active (aquela que desenha a linha ferrugem embaixo do texto).

O Segredo do Pulo do Gato: data-section="${section.id}"
Isso aqui é a ponte para o nosso próximo passo. Nós adicionamos um atributo invisível no HTML chamado data-section. Ele não muda nada no visual, mas vai guardar em segredo o "id" de cada seção (guias, referencia, comunidade). No futuro, quando o garçom (o script principal) escutar o clique, ele vai ler esse data-section e saber exatamente o que pedir para a Sidebar desenhar!

## AppSidebar

O que estamos fazendo aqui?
this.renderMenu(docsConfig[0].id);
Quando o HTML lê a tag <app-sidebar>, ele aciona o connectedCallback. Como a tela acabou de carregar, nós mandamos ele desenhar logo de cara a primeira aba do nosso config.js (que é "guias").

O Método .find()
Lembra do map() que usamos no Header para passar por todos os itens? O find() serve para buscar um item específico. Ele varre o nosso config.js perguntando: "Qual bloco de dados tem o id igual a 'guias'?". Quando ele acha, ele guarda aquele bloco inteiro na variável sectionData.

O Segredo: data-file="${page.file}"
Igual fizemos com o data-section no Header, aqui colocamos o data-file. O usuário vai ver escrito "Instalação" bonitinho na tela. Mas, escondido no HTML, vai estar data-file="instalacao.html". Quando clicarmos nesse botão lá no Passo 4, nosso JavaScript vai ler esse atributo invisível e fazer o Fetch buscar exatamente esse arquivo.

## script.js - Escutando os botões

Dissecando a Lógica (Mini-Doc)

DOMContentLoaded: Essa é uma regra de ouro no Vanilla JS. Significa "Só comece a procurar botões e tags depois que o navegador terminar de desenhar a tela inteira". Isso evita aquele erro clássico do JavaScript tentar colocar um evento de clique num botão que ainda nem apareceu na tela.

document.querySelectorAll('.nav-link'): Aqui pegamos uma lista de todos os links do Header.

addEventListener('click'): Este é o "ouvido" do JavaScript. Colocamos um ouvinte em cada link. Quando o usuário clica, ele engatilha a nossa função.

event.preventDefault(): Links <a> têm a mania de tentar abrir outras páginas ou jogar a tela para o topo. Esse comando diz "Fica quieto, link! Quem manda no clique agora sou eu".

A Troca de Classes: Fazemos um loop que remove o destaque (a classe active) de todo mundo, e depois colocamos apenas no alvo clicado (link.classList.add('active')).

sidebar.renderMenu(sectionId): Essa é a mágica da Programação Orientada a Objetos com Web Components. Como selecionamos a nossa tag <app-sidebar> lá no começo, nós temos acesso a todas as funções que você criou dentro dela. Nós simplesmente ativamos a função e passamos o nome da categoria que o usuário quer ver.

## script.js - atualização das páginas

Mini-Doc: O que há de novo aqui?
A Delegação de Eventos (event.target.closest): Se a gente atrelasse o clique apenas nos botões da Sidebar e, de repente, o usuário clicasse no Header para trocar de menu, aqueles botões antigos da Sidebar seriam apagados pelo JavaScript. Se atrelássemos de novo nos novos botões, o código ia ficar enorme e quebrado. Colocar o "Ouvido" no contêiner pai (A Sidebar inteira) é a técnica Sênior para interceptar cliques de coisas que nascem e morrem dinamicamente na tela.

async e await: O Fetch é um processo demorado para o computador (ele vai até outra pasta/servidor buscar o arquivo). Se não mandarmos o JavaScript "esperar" (await), ele vai tentar injetar o texto no <main> antes mesmo de o arquivo chegar, causando um erro de variável vazia.

O Bloco try / catch: É a rede de segurança do desenvolvedor. Se o seu amigo do trabalho colocar um link no config.js mas esquecer de criar o arquivo lá na pasta pages, a tela não vai travar nem ficar branca. O nosso catch entra em ação e mostra um aviso amigável de erro 404.
