# Guia de uso e organização

Atualizado em 2026-10-12. Este guia ensina a abrir o tema, criar uma instalação e validar uma mudança. A versão `0.1.0` está pronta para validação independente antes da publicação.

## 1. Abrir a demonstração

Para apenas abrir e experimentar o tema, não é necessário instalar `node_modules`. Com Node.js 24 instalado, execute:

```sh
node tools/serve.mjs
```

Abra `http://127.0.0.1:4173`. Para parar o servidor, volte ao terminal e pressione `Ctrl+C`.

Também é possível usar `npm start`; esse comando chama o mesmo servidor e não exige os pacotes de desenvolvimento. A opção Live Server continua válida. Não abra o projeto por `file://`, porque os módulos e as páginas precisam de um servidor HTTP. Não existe etapa de build.

Sem `site/config.js`, o site mostra o conteúdo de `examples/`. Com esse arquivo, passa a usar a instalação local após recarregar. Somente HTTP 404 na verificação de `site/config.js` ativa os exemplos. Erros de sintaxe, acesso ou conexão aparecem na tela. O servidor precisa devolver 404 para arquivos inexistentes, sem substituir o pedido por `index.html`.

Existem, portanto, dois modos de execução:

| Situação                    | Resultado                                                                  |
| --------------------------- | -------------------------------------------------------------------------- |
| `site/config.js` não existe | Mostra a demonstração de `examples/`                                       |
| `site/config.js` existe     | Mostra a instalação local de `site/`, mesmo quando `docsConfig` está vazio |

Quem baixa ou clona o tema não precisa renomear arquivos para ver a demonstração: `site/` é ignorada pelo Git e não acompanha o repositório. Em uma cópia que já possui uma instalação local, renomear somente `site/config.js` para `site/config.local.js` desativa temporariamente essa instalação. Não é necessário renomear `pages/`, `assets/` ou `custom.css`; ao restaurar o nome `site/config.js`, esses caminhos precisam conservar os nomes definidos pelo contrato.

## 2. Criar sua instalação

O caminho mais simples é copiar a demonstração. Faça isso somente quando a pasta `site/` ainda não existir:

No PowerShell, apenas quando a pasta de destino ainda não existir:

```powershell
Copy-Item -LiteralPath .\examples -Destination .\site -Recurse
```

A cópia cria `site/config.js`, `site/pages/`, `site/assets/` e `site/custom.css`. Depois, substitua os textos fictícios pelos seus.

Se preferir começar vazio, crie essas quatro estruturas manualmente. O arquivo `site/config.js` é obrigatório; as outras pastas e o CSS são usados conforme a necessidade.

A demonstração contém somente páginas fictícias completas. Ela serve como referência de estrutura, não como conteúdo para uma instalação real.

A pasta `site/` é ignorada pelo Git do tema. Ela não será enviada por um commit comum desse tema e precisa de backup próprio. Ignorar no Git não torna os arquivos privados na hospedagem nem impede adição forçada. Para conteúdo empresarial, o controle de acesso continua sendo uma etapa separada.

## 3. Saber o que editar

| Quero alterar                        | Arquivo ou pasta                          |
| ------------------------------------ | ----------------------------------------- |
| Nome, marca textual e título lateral | `site/config.js`, dentro de `appSettings` |
| Abas, páginas e ordem dos menus      | `site/config.js`, dentro de `docsConfig`  |
| Texto de uma página                  | `site/pages/nome-da-pagina.html`          |
| Imagens ou anexos                    | `site/assets/`                            |
| Cores e ajustes locais               | `site/custom.css`                         |
| Funcionamento compartilhado          | Arquivos do tema em `js/`                 |
| Estilos padrão compartilhados        | Arquivos do tema em `css/`                |

Os caminhos desta tabela são relativos à raiz do projeto. Mudanças do tema chegam a outra instalação somente quando ela recebe a atualização.

## 4. Dar nomes aos arquivos e IDs

Não existe uma única convenção obrigatória para todo projeto. Aqui adotamos:

- Pastas e módulos comuns em minúsculas, usando hífen quando houver mais de uma palavra: `load-site.js`.
- Arquivos que representam classes de componentes em PascalCase, acompanhando o nome da classe: `AppHeader.js` e `AppSidebar.js`.
- Páginas com nomes descritivos, sem espaços ou acentos: `primeiros-passos.html`. Letras minúsculas, números e hífens são aceitos.
- Títulos visíveis podem ter espaços e acentos: “Primeiros passos”.
- Nomes de variáveis e funções em camelCase: `appSettings`, `loadSite`.
- Manter `README.md`, `AGENTS.md`, `CHANGELOG.md` e os documentos existentes. Renomear todos os manuais não ajudaria esta mudança.

`main.js` é o ponto de entrada: inicia a aplicação. `load-site.js` escolhe e valida a configuração. `config.js` continua sendo um nome adequado dentro de cada pasta de conteúdo.

## 5. Configurar e adicionar páginas

Exemplo de `site/config.js`:

```js
export const appSettings = {
  siteTitle: "Wiki de pesca",
  logoText: "PESCA",
  sidebarTitle: "Conteúdo",
};

export const docsConfig = [
  {
    id: "pesca",
    title: "Pesca",
    pages: [{ id: "equipamentos", title: "Equipamentos", file: "equipamentos.html", icon: "🎣" }],
  },
];
```

`siteTitle` aparece no título do navegador e nas boas-vindas; `logoText` aparece no cabeçalho. A versão exibida pertence ao tema, definida em `js/main.js`, e não precisa ser copiada para a configuração local.

Os IDs de aba e de página devem usar minúsculas, números e hífens. O ID da página deve ser único dentro da aba e forma a URL; mantenha-o estável mesmo se o título ou o arquivo mudar. `title` é o texto apresentado. `file` aponta para um arquivo diretamente em `site/pages/`, sem subpastas. `icon` é opcional. Configurações antigas sem `page.id` continuam funcionando: nesse caso, o tema deriva o ID do nome do arquivo. Não repetir o mesmo arquivo dentro da mesma aba. Uma lista vazia é aceita e produz um estado vazio.

Criar `site/pages/equipamentos.html`:

```html
<h1>Equipamentos</h1>
<p>Exemplo fictício de uma wiki de pesca.</p>
<h2 id="varas">Varas</h2>
<p>Organize aqui as informações sobre as varas.</p>
```

Recarregar o navegador. O cabeçalho e a lateral usam essa configuração. Um arquivo sozinho na pasta não se cadastra automaticamente no menu.

A página deve ser um fragmento HTML, sem `html`, `head`, scripts ou contêiner de leitura próprio. O tema já cria o contêiner de leitura. Use exatamente um `h1` por página. Se houver mais de um, o tema mantém a página legível, mas mostra um aviso para o autor corrigir a hierarquia.

## 6. Usar links e imagens

O endereço de página continua no formato `#pesca/equipamentos`. Os links dos menus agora têm esse destino real. Ao abrir o site sem fragmento, o tema procura a primeira página válida da configuração e completa o endereço sem criar uma etapa extra no histórico. Um endereço contendo apenas a aba também abre sua primeira página; uma aba sem páginas mostra um aviso. Link direto, F5, Voltar/Avançar e navegação pelo teclado funcionam para páginas cadastradas.

O endereço depende dos IDs da aba e da página. Mudar o título de exibição ou o arquivo preserva o link; mudar um ID altera o endereço. O índice lê `h1`, `h2` e `h3` e cria links como `#pesca/equipamentos/varas`. Ao selecionar um título, a rolagem para no início do espaço superior definido pelo título, em vez de colá-lo no topo da leitura. O movimento é suave, exceto quando o sistema pede movimento reduzido. IDs escritos no HTML são preservados; quando não há `id`, o tema gera um endereço legível. Para manter um link compartilhado mesmo após renomear o título, prefira declarar um ID estável, como `<h2 id="varas">Varas para iniciantes</h2>`.

Ao rolar manualmente, o índice e o endereço acompanham a seção atual. Essa atualização substitui somente o trecho da URL e não cria uma nova entrada no histórico a cada movimento. Selecionar o `h1` no índice volta ao início da página.

Como o fragmento HTML é inserido em `index.html`, imagens são resolvidas a partir desse documento. Para uma imagem em `site/assets/vara.png`, usar:

```html
<img src="./site/assets/vara.png" alt="Vara usada no exemplo de pesca" />
```

Links e imagens dos exemplos que mencionem `examples/assets/` devem ser ajustados para `site/assets/` ao copiar o conteúdo. Não há reescrita automática desses caminhos.

## 7. Personalizar a aparência

`site/custom.css` é carregado depois dos estilos do tema. Manter esse arquivo, mesmo vazio. Exemplo:

```css
:root {
  --color-ferrugem: #26734d;
}
```

Isso permite mudar uma cor da instalação sem alterar `css/variables.css`. `content.css` oferece uma base visual para títulos `h1`–`h6`, texto, links, ênfases, citações, código, listas, termos e definições, tabelas, imagens, vídeo, áudio e detalhes expansíveis. A página fictícia **Referência → Catálogo de estilos** mostra os padrões principais. **Guias → Exemplos práticos** mostra como escrever cada padrão.

Em blocos `<pre><code>`, use `data-language="HTML"` para mostrar a linguagem no canto superior. `title="HTML"` também é aceito por compatibilidade, mas `data-language` é preferível porque descreve diretamente uma informação usada pelo tema.

Para uma introdução destacada, usar `class="lead"` em um parágrafo. Os avisos públicos são `callout callout-info`, `callout callout-warning` e `callout callout-danger`; cada aviso deve incluir um rótulo textual e pode usar `callout-icon` e `callout-title`. Cor e ícone sozinhos não substituem o texto.

Tabelas e blocos de código largos ganham rolagem horizontal própria. Imagens respeitam a largura da leitura. Em telas de até 800 px, o botão “Abrir menu de páginas” controla a lateral, `Esc` a fecha e “Nesta página” se torna recolhível. Ao abrir um link de título, o trecho é posicionado abaixo desse índice fixo. Os antigos botões de tema e configurações foram removidos porque ainda não possuíam função. Login corporativo continua sendo uma etapa separada.

No desktop, os painéis laterais podem ser recolhidos pelos botões das bordas. A divisória ao lado de cada painel pode ser arrastada. Pelo teclado, selecione a divisória com `Tab` e use as setas esquerda/direita. A largura fica limitada para não ocupar toda a leitura.

## 8. Migrar uma cópia anterior

Antes de atualizar uma cópia antiga com conteúdo próprio, fazer backup fora do checkout do tema. Não confiar no Git do tema para guardar conteúdo confidencial.

| Caminho antigo                 | Destino da instalação                    |
| ------------------------------ | ---------------------------------------- |
| `js/config.js` personalizado   | `site/config.js`                         |
| `pages/` com conteúdo próprio  | `site/pages/`                            |
| `css/customization/custom.css` | `site/custom.css`                        |
| Imagens e anexos próprios      | `site/assets/`, ajustando as referências |

Preservar os exports `appSettings` e `docsConfig`. Os novos campos de identidade têm valores padrão quando omitidos; `appSettings.version` antigo deixa de controlar a versão do tema. Manter os IDs de abas e nomes de arquivo conserva links como `#guias/instalacao`.

No código do tema, `js/script.js` virou `js/main.js`, e o `index.html` já referencia o novo nome. Os exemplos antes em `js/config.js`, `pages/` e no CSS de personalização agora ficam em `examples/`.

Após migrar, conferir `git ls-files site` (sem arquivos) e `git check-ignore -v site/config.js` (regra encontrada). Arquivos que já foram rastreados ou enviados não saem do histórico apenas por ganharem uma regra de ignore. Atualizar uma cópia antiga pode ainda exigir resolver suas alterações rastreadas; os novos caminhos não eliminam divergências anteriores.

## 9. Validar o tema

Esta parte é para quem altera os arquivos do tema. Instale as ferramentas uma vez:

```sh
npm ci
npx playwright install chromium
```

Depois execute:

```sh
npm test
npm run test:browser
npm run validate
```

`npm test` verifica regras isoladas e a atualização de duas instalações fictícias. `npm run test:browser` abre o Chromium e verifica as jornadas principais em desktop e celular. `npm run validate` executa todas as verificações.

Para verificar manualmente: abrir um link antigo, navegar, recarregar e usar Voltar; trocar o nome e o CSS locais; conferir um arquivo ausente e uma configuração inválida. A [matriz do plano](PLANO-MVP.md) contém os cenários das próximas etapas.

## 10. Atualizar com segurança

1. Fazer backup de `site/` fora da pasta do tema.
2. Ler o [changelog](../CHANGELOG.md).
3. Receber a atualização em uma cópia de teste.
4. Executar `npm run validate`.
5. Abrir sua instalação e conferir os links, o índice e o CSS local.
6. Somente depois usar a versão atualizada no ambiente principal.

O [fluxo de atualização](ARQUITETURA.md) explica os comandos e o processo de reversão.
