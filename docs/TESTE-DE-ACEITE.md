# Teste de aceite do MVP

Este roteiro é para a pessoa que recebeu uma cópia do tema pela primeira vez. Faça os passos na ordem e anote qualquer dúvida. Não é necessário conhecer o código do projeto.

## 1. Abrir a demonstração

1. Instale o Node.js 24.
2. Abra um terminal na pasta do projeto.
3. Execute `node tools/serve.mjs`.
4. Abra `http://127.0.0.1:4173`.

Resultado esperado: a demonstração abre com abas no topo, páginas na lateral e “Nesta página” à direita. No celular, a lateral e o índice usam botões para abrir e fechar. Abra também a página “Exemplos práticos” para conhecer o HTML aceito pelo tema.

## 2. Criar uma instalação

No PowerShell, execute este comando somente se a pasta `site/` ainda não existir:

```powershell
Copy-Item -LiteralPath .\examples -Destination .\site -Recurse
```

Depois:

1. Abra `site/config.js`.
2. Troque `siteTitle` para `Wiki de teste`.
3. Recarregue o navegador.

Resultado esperado: o novo nome aparece na aba do navegador. Os arquivos de `examples/` continuam intactos.

## 3. Criar uma página

1. Cadastre uma página em `site/config.js` com o ID `primeiros-passos` e o arquivo `primeiros-passos.html`.
2. Crie `site/pages/primeiros-passos.html` com este conteúdo:

```html
<h1>Primeiros passos</h1>
<p>Minha primeira página de teste.</p>
<h2 id="proximo-passo">Próximo passo</h2>
<p>Este trecho possui um endereço estável.</p>
```

3. Recarregue o navegador e abra a página criada.

Resultado esperado: a página aparece na lateral e os dois títulos aparecem no índice. Use apenas um `h1` por página. Se houver mais de um, o tema mostra um aviso para o autor corrigir.

## 4. Conferir os links

1. Copie o endereço do título “Próximo passo”.
2. Abra o endereço em outra aba.
3. Recarregue a página.
4. Use os botões Voltar e Avançar do navegador.

Resultado esperado: a aba, a página e o título corretos continuam selecionados.

5. Role a página sem clicar no índice e copie o endereço novamente.

Resultado esperado: o último trecho destacado também aparece no endereço, sem criar várias entradas no histórico.

## 5. Conferir o desktop

1. Use as setas nas bordas dos dois painéis laterais para recolher e expandir cada painel.
2. Arraste a borda de um painel para mudar sua largura.
3. Se preferir o teclado, selecione a borda com `Tab` e use as setas esquerda e direita.

Resultado esperado: os painéis podem ser ajustados sem esconder o conteúdo central.

## 6. Conferir celular e teclado

1. Reduza a janela para uma largura parecida com a de um celular.
2. Abra e feche o menu de páginas.
3. Pressione `Esc` com o menu aberto.
4. Use `Tab` para navegar pelos links.

Resultado esperado: não há corte horizontal; o menu fecha com `Esc`; o foco do teclado permanece visível.

## 7. Conferir um bloco de código

Adicione à página:

```html
<pre data-language="HTML"><code>&lt;p&gt;Exemplo&lt;/p&gt;</code></pre>
```

Resultado esperado: “HTML” aparece no canto superior do bloco. O atributo `title="HTML"` também funciona, mas `data-language` é preferido porque descreve a função do valor com clareza.

## 8. Registrar o resultado

Anote:

- revisão testada;
- sistema operacional e navegador;
- passos que passaram;
- passo que não funcionou;
- mensagem exibida;
- dúvida causada pelo guia.

Se todos os passos passarem sem ajuda, a validação independente do MVP está concluída. Não use documentos confidenciais neste teste.
