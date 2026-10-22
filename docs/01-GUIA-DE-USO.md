# Guia de uso

> Este guia descreve a versão estática atual. Editor visual, configurações pela interface e IA ainda
> não existem. Eles serão entregues em etapas segundo o
> [plano da próxima versão](08-PLANO-PROXIMA-VERSAO.md). Até lá, os passos com `config.js` e HTML abaixo
> continuam corretos.

Este guia ensina a criar e manter uma documentação com o tema. Siga as seções na ordem na primeira
vez. Depois, use o índice para consultar somente o que precisar.

## 1. Entender o que o tema faz

Você informa três níveis:

1. **Abas**: grupos principais no cabeçalho.
2. **Páginas**: itens no menu esquerdo.
3. **Títulos**: seções `h1`, `h2` e `h3` dentro de cada página.

O tema lê essas informações e monta a navegação. Você não precisa editar os componentes em `js/`.

## 2. Abrir a demonstração

No terminal, dentro da pasta do projeto, execute:

```sh
npm start
```

Abra `http://127.0.0.1:4173`.

Quando `site/config.js` não existe, a demonstração de `examples/` aparece. Ela usa somente conteúdo
fictício e pode ser explorada sem criar uma instalação.

Para parar o servidor, pressione `Ctrl + C` no terminal.

## 3. Criar sua instalação

Execute uma vez:

```sh
npm run create-site
```

O comando recusa continuar quando a pasta `site/` já existe. Assim, uma instalação existente não é
substituída por engano.

Estrutura criada:

```text
site/
├── config.js
├── custom.css
├── assets/
└── pages/
    └── inicio.html
```

Recarregue o navegador. O tema deixa de usar `examples/` e passa a usar `site/`.

### Criar manualmente

Se não quiser usar o comando, copie `examples/starter/` para uma nova pasta chamada `site/` e crie
dentro dela uma pasta vazia chamada `assets/`.

## 4. Entender cada arquivo

| Caminho                | Conteúdo                                | Obrigatório |
| ---------------------- | --------------------------------------- | ----------- |
| `site/config.js`       | Nome, abas, páginas e ordem dos menus   | Sim         |
| `site/pages/nome.html` | Texto de uma página                     | Sim         |
| `site/assets/`         | Imagens, PDFs, vídeos e outros arquivos | Não         |
| `site/custom.css`      | Personalizações visuais da instalação   | Não         |

O marcador da instalação é `site/config.js`. Um erro de sintaxe nesse arquivo mostra uma mensagem;
o tema não troca silenciosamente para a demonstração.

## 5. Configurar nome e menus

Abra `site/config.js`:

```js
export const appSettings = {
  siteTitle: "Manual da equipe",
  logoText: "MANUAL",
  sidebarTitle: "Páginas",
};

export const docsConfig = [
  {
    id: "guias",
    title: "Guias",
    pages: [
      {
        id: "primeiros-passos",
        title: "Primeiros passos",
        file: "primeiros-passos.html",
        icon: "📘",
      },
    ],
  },
];
```

### Campos de identidade

- `siteTitle`: título da aba do navegador.
- `logoText`: nome curto no canto superior esquerdo.
- `sidebarTitle`: rótulo acima do menu de páginas.

### Campos de uma aba

- `id`: parte do endereço. Use minúsculas, números e hífens.
- `title`: nome mostrado no cabeçalho.
- `pages`: páginas da aba, na ordem em que devem aparecer.

### Campos de uma página

- `id`: parte do endereço da página.
- `title`: nome mostrado no menu.
- `file`: arquivo dentro de `site/pages/`.
- `icon`: ícone opcional mostrado no menu.

Mantenha os IDs depois que os links forem compartilhados. Você pode trocar `title` sem mudar o
endereço.

## 6. Criar uma página

Crie `site/pages/primeiros-passos.html`:

```html
<h1>Primeiros passos</h1>
<p class="lead">O que a pessoa aprenderá nesta página.</p>

<h2 id="preparar">1. Preparar</h2>
<p>Explique o que precisa estar pronto.</p>

<h2 id="executar">2. Executar</h2>
<ol>
  <li>Faça a primeira ação.</li>
  <li>Faça a segunda ação.</li>
  <li>Confira o resultado.</li>
</ol>
```

Depois, cadastre o arquivo em `site/config.js`, salve e recarregue.

### Regra simples para títulos

- Use exatamente um `h1`: título da página.
- Use `h2`: seções principais.
- Use `h3`: partes de uma seção.
- Use `h4`, `h5` e `h6` somente para detalhes mais profundos.

O índice usa `h1`, `h2` e `h3`. O tema cria IDs automaticamente, mas um ID escrito por você é mais
seguro para links que serão compartilhados:

```html
<h2 id="instalar-programa">Instalar o programa</h2>
```

## 7. Escrever com menos código

Comece pelo modelo de `examples/starter/pages/inicio.html`. Depois, copie componentes da página
**Guias → Escrever páginas** da demonstração.

Essa página mostra e permite copiar:

- títulos e parágrafos;
- links e listas;
- listas de tarefas;
- citações e código;
- tabelas;
- imagens, áudio e vídeo;
- conteúdo expansível;
- avisos de informação, atenção e perigo;
- texto semântico e acessível.

Todo bloco de código possui um botão de cópia no canto superior direito.

## 8. Adicionar imagens e arquivos

Coloque o arquivo em `site/assets/`. Depois use um caminho que começa na raiz do projeto:

```html
<figure>
  <img src="./site/assets/fluxo.png" alt="Fluxo de aprovação em três etapas" />
  <figcaption>Fluxo usado pela equipe para aprovar um documento.</figcaption>
</figure>
```

Escreva o texto alternativo com a informação transmitida pela imagem. Se a imagem for apenas
decorativa, use `alt=""`.

## 9. Criar links

Formato dos endereços:

| Destino | Formato                            |
| ------- | ---------------------------------- |
| Aba     | `#guias`                           |
| Página  | `#guias/primeiros-passos`          |
| Título  | `#guias/primeiros-passos/preparar` |

Exemplo:

```html
<a href="#guias/primeiros-passos/preparar">Ir para a preparação</a>
```

Links reais permitem copiar o endereço, abrir em outra aba, recarregar e usar Voltar ou Avançar.

## 10. Usar listas de tarefas

```html
<ul class="task-list">
  <li>
    <label><input type="checkbox" checked /> Tarefa concluída</label>
  </li>
  <li>
    <label><input type="checkbox" /> Próxima tarefa</label>
  </li>
</ul>
```

O estado muda enquanto a página está aberta. Ao recarregar, volta ao valor escrito no HTML. Salvar
o estado exigiria armazenamento adicional, que não faz parte deste tema estático.

## 11. Usar conteúdo expansível

```html
<details>
  <summary>Mostrar mais informações</summary>
  <p>Conteúdo que pode permanecer fechado até ser necessário.</p>
</details>
```

O navegador fornece clique e teclado. Não adicione JavaScript.

## 12. Personalizar o visual

Use `site/custom.css`. Esse arquivo é carregado depois do CSS do tema.

```css
:root {
  --color-ferrugem: #2563eb;
  --content-width: 860px;
}
```

Evite editar `css/variables.css` para personalizar uma instalação. Alterações no tema dificultam
receber atualizações futuras.

## 13. Conferir antes de publicar

- [ ] Existe somente um `h1` em cada página.
- [ ] A ordem dos títulos faz sentido.
- [ ] Links e imagens abrem corretamente.
- [ ] Imagens possuem texto alternativo.
- [ ] A página funciona pelo teclado.
- [ ] A página cabe numa tela estreita.
- [ ] Nenhum dado privado foi colocado numa hospedagem pública.
- [ ] A pasta `site/` possui backup.

Use também o [teste de aceite](04-TESTE-DE-ACEITE.md).

## 14. Atualizar o tema

Antes de atualizar:

1. Faça backup de `site/` fora da pasta do projeto.
2. Leia `CHANGELOG.md`.
3. Anote a revisão que está funcionando.
4. Teste a versão nova numa cópia.

Quando o checkout do tema estiver limpo e sem commits próprios divergentes:

```sh
git fetch origin
git diff --stat HEAD origin/main
git pull --ff-only origin main
```

Depois, confira páginas, links, imagens e `site/custom.css`.

## 15. Migrar uma instalação antiga

| Caminho antigo                 | Caminho atual     |
| ------------------------------ | ----------------- |
| `js/config.js`                 | `site/config.js`  |
| `pages/`                       | `site/pages/`     |
| `css/customization/custom.css` | `site/custom.css` |
| Imagens antigas                | `site/assets/`    |

Faça backup antes de mover arquivos. Ajuste os caminhos das imagens depois da mudança.

## 16. Resolver problemas comuns

### A demonstração aparece no lugar do meu conteúdo

Confira se o arquivo se chama exatamente `site/config.js` e recarregue pelo servidor HTTP.

### A página não aparece no menu

Confira se ela foi cadastrada em `docsConfig` e se `file` corresponde ao nome em `site/pages/`.

### A página mostra “Arquivo não encontrado”

Confira maiúsculas, minúsculas, hífens e a extensão `.html`.

### A imagem não aparece

Confira se o arquivo está em `site/assets/` e se o caminho começa com `./site/assets/`.

### O site não abre com file://

Esse modo não é suportado. Execute `npm start` e use `http://127.0.0.1:4173`.

### O conteúdo precisa ser privado

Não publique até existir autenticação e autorização no servidor para páginas e anexos. Esconder
elementos com JavaScript não protege os arquivos.
