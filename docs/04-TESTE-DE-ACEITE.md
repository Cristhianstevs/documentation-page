# Teste de aceite do MVP

Este roteiro é para uma pessoa que nunca usou o tema. Faça tudo na ordem, sem ajuda. Anote qualquer
passo que não esteja claro.

Este teste cobre somente o tema estático `0.1.0`. A migração, o editor e a IA terão critérios de
aceite próprios no [plano da próxima versão](08-PLANO-PROXIMA-VERSAO.md).

Use somente conteúdo fictício.

## 1. Preparar

1. Instale o Node.js 24 ou mais recente.
2. Abra um terminal na pasta do projeto.
3. Execute `npm start`.
4. Abra `http://127.0.0.1:4173`.

Resultado esperado: a demonstração abre com abas, menu de páginas, conteúdo e índice “Nesta
página”.

## 2. Criar uma instalação

Pare o servidor com `Ctrl + C`. Depois execute:

```sh
npm run create-site
npm start
```

Resultado esperado: a pasta `site/` é criada e o navegador mostra a página “Bem-vindo”.

Execute `npm run create-site` novamente.

Resultado esperado: o comando avisa que `site/` já existe e não altera os arquivos.

## 3. Mudar o nome

1. Abra `site/config.js`.
2. Troque `siteTitle` para `Documentação de teste`.
3. Troque `logoText` para `TESTE`.
4. Salve e recarregue.

Resultado esperado: o novo nome aparece na aba do navegador e no cabeçalho.

## 4. Criar uma página

Crie `site/pages/primeiros-passos.html`:

```html
<h1>Primeiros passos</h1>
<p class="lead">Minha primeira página.</p>

<h2 id="preparar">Preparar</h2>
<p>Este trecho possui um endereço estável.</p>
```

Cadastre a página dentro de `pages` em `site/config.js`:

```js
{
  id: 'primeiros-passos',
  title: 'Primeiros passos',
  file: 'primeiros-passos.html',
  icon: '📘',
},
```

Resultado esperado: a página aparece no menu e os títulos aparecem no índice.

## 5. Conferir links

1. Abra o título “Preparar”.
2. Copie o endereço.
3. Abra o endereço em outra aba.
4. Recarregue.
5. Use Voltar e Avançar.

Resultado esperado: a aba, a página e o título corretos continuam selecionados.

## 6. Conferir componentes

Copie para a página um aviso, uma lista de tarefas e um bloco expansível da página **Guias →
Escrever páginas**.

Resultado esperado:

- o botão do bloco de código copia o HTML;
- o checkbox pode ser marcado pelo mouse e pela tecla Espaço;
- o bloco expansível abre pelo mouse e pela tecla Enter;
- o foco do teclado fica visível.

## 7. Conferir desktop

1. Recolha e abra os dois painéis laterais.
2. Arraste a borda de cada painel.
3. Selecione a borda com `Tab` e use as setas.

Resultado esperado: os painéis mudam sem cobrir o conteúdo.

## 8. Conferir celular

1. Reduza a janela para cerca de 390 px.
2. Abra e feche o menu de páginas.
3. Abra o menu e pressione `Esc`.
4. Abra e feche “Nesta página”.

Resultado esperado: não existe corte horizontal e os menus continuam acessíveis.

## 9. Registrar o resultado

Anote:

- revisão testada;
- sistema e navegador;
- passos concluídos;
- passo que falhou;
- mensagem exibida;
- dúvida causada pelo texto.

Se uma pessoa concluir tudo sem ajuda, a clareza do MVP foi validada. Login, publicação e controle
de acesso não fazem parte deste roteiro.
