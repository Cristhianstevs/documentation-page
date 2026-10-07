# Guia de uso e organização

Atualizado em 2026-10-07. A separação entre tema e instalação está implementada. O índice de títulos, links de trechos e o catálogo visual ainda estão no [plano do MVP](PLANO-MVP.md).

## Executar

Abrir a pasta no VS Code e servir por HTTP local, por exemplo com Live Server no `index.html`. Não abrir por `file://`, porque o projeto usa módulos e carregamento de arquivos por HTTP. Não existe etapa de build nem `npm start`.

Sem `site/config.js`, o site mostra o conteúdo de `examples/`. Com esse arquivo, passa a usar a instalação local após recarregar. Somente HTTP 404 na verificação de `site/config.js` ativa os exemplos. Erros de sintaxe, acesso ou conexão aparecem na tela. O servidor precisa devolver 404 para arquivos inexistentes, sem substituir o pedido por `index.html`.

Existem, portanto, dois modos de execução:

| Situação | Resultado |
| --- | --- |
| `site/config.js` não existe | Mostra a demonstração de `examples/` |
| `site/config.js` existe | Mostra a instalação local de `site/`, mesmo quando `docsConfig` está vazio |

Quem baixa ou clona o tema não precisa renomear arquivos para ver a demonstração: `site/` é ignorada pelo Git e não acompanha o repositório. Em uma cópia que já possui uma instalação local, renomear somente `site/config.js` para `site/config.local.js` desativa temporariamente essa instalação. Não é necessário renomear `pages/`, `assets/` ou `custom.css`; ao restaurar o nome `site/config.js`, esses caminhos precisam conservar os nomes definidos pelo contrato.

## Criar sua instalação

Em uma cópia nova, crie `site/config.js`, `site/pages/`, `site/assets/` e `site/custom.css` para começar do zero; se preferir uma base preenchida, copie `examples` para `site` somente quando a pasta de destino ainda não existir.

No PowerShell, apenas quando a pasta de destino ainda não existir:

```powershell
Copy-Item -LiteralPath .\examples -Destination .\site -Recurse
```

A cópia contém a configuração, páginas e CSS de demonstração. A pasta `assets/` recebe imagens e anexos. O arquivo `.gitkeep` apenas permite guardar essa pasta vazia no Git dos exemplos; pode ser removido da sua cópia local.

A demonstração contém somente páginas fictícias completas. Ela serve como referência de estrutura, não como conteúdo para uma instalação real.

A pasta `site/` é ignorada pelo Git do tema. Ela não será enviada por um commit comum desse tema e precisa de backup próprio. Ignorar no Git não torna os arquivos privados na hospedagem nem impede adição forçada. Para conteúdo empresarial, o controle de acesso continua sendo uma etapa separada.

## O que editar no dia a dia

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

## Convenção de nomes

Não existe uma única convenção obrigatória para todo projeto. Aqui adotamos:

- Pastas e módulos comuns em minúsculas, usando hífen quando houver mais de uma palavra: `load-site.js`.
- Arquivos que representam classes de componentes em PascalCase, acompanhando o nome da classe: `AppHeader.js` e `AppSidebar.js`.
- Páginas com nomes descritivos, sem espaços ou acentos: `primeiros-passos.html`. Letras minúsculas, números e hífens são aceitos.
- Títulos visíveis podem ter espaços e acentos: “Primeiros passos”.
- Nomes de variáveis e funções em camelCase: `appSettings`, `loadSite`.
- Manter `README.md`, `AGENTS.md`, `CHANGELOG.md` e os documentos existentes. Renomear todos os manuais não ajudaria esta mudança.

`main.js` é o ponto de entrada: inicia a aplicação. `load-site.js` escolhe e valida a configuração. `config.js` continua sendo um nome adequado dentro de cada pasta de conteúdo.

## Configurar e adicionar páginas

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

A página deve ser um fragmento HTML, sem `html`, `head`, scripts ou contêiner de leitura próprio. O tema já cria o contêiner de leitura.

## Links e imagens

O endereço de página continua no formato `#pesca/equipamentos`. Os links dos menus agora têm esse destino real. O cabeçalho abre a primeira página da aba; uma aba sem páginas mostra um aviso. Link direto, F5, Voltar/Avançar e navegação pelo teclado funcionam para páginas cadastradas.

O endereço depende dos IDs da aba e da página. Mudar o título de exibição ou o arquivo preserva o link; mudar um ID altera o endereço. Links para títulos ainda não foram implementados.

Como o fragmento HTML é inserido em `index.html`, imagens são resolvidas a partir desse documento. Para uma imagem em `site/assets/vara.png`, usar:

```html
<img src="./site/assets/vara.png" alt="Vara usada no exemplo de pesca" />
```

Links e imagens dos exemplos que mencionem `examples/assets/` devem ser ajustados para `site/assets/` ao copiar o conteúdo. Não há reescrita automática desses caminhos.

## Personalizar a aparência

`site/custom.css` é carregado depois dos estilos do tema. Manter esse arquivo, mesmo vazio. Exemplo:

```css
:root {
  --color-ferrugem: #26734d;
}
```

Isso permite mudar uma cor da instalação sem alterar `css/variables.css`. O catálogo de conteúdo em `content.css` ainda está pendente. Login corporativo, responsividade completa e os botões de tema/configurações também permanecem pendentes.

## Migrar uma cópia anterior

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

## Validar e atualizar

Com Node.js 24 ativo, executar `node --test tests/load-site.test.mjs`. São testes nativos, sem instalar dependências. Ainda não existe `npm test`. Eles verificam seleção, validação e isolamento da instalação, não substituem os testes de interface.

Para verificar manualmente: abrir um link antigo, navegar, recarregar e usar Voltar; trocar o nome e o CSS locais; conferir um arquivo ausente e uma configuração inválida. A [matriz do plano](PLANO-MVP.md) contém os cenários das próximas etapas.

Ler o [changelog](../CHANGELOG.md), fazer backup da instalação e testar atualizações em uma cópia. O [fluxo de atualização](ARQUITETURA.md) explica como receber mudanças sem editar os arquivos do tema em cada instalação.
