# Recuperação da versão segura

Recuperar significa conseguir colocar a última versão conhecida de volta sem apagar os documentos do
usuário. A pasta `site/` pertence à instalação e não deve ser substituída pelo tema.

## O que já é comprovado

`tests/update.test.mjs` cria instalações fictícias, executa o fluxo de atualização e verifica que o
conteúdo local, os arquivos e o CSS personalizado continuam preservados. Esse teste também cobre a
criação e a restauração de backup.

## Procedimento previsto para uma versão publicada

1. Parar o servidor que está atendendo a documentação.
2. Fazer uma cópia separada de `site/` e conferir que ela pode ser aberta.
3. Obter a revisão marcada com a tag `v0.1.0` em uma pasta separada.
4. Levar a cópia de `site/` para essa instalação, sem sobrescrever o backup original.
5. Iniciar o servidor e testar a página inicial, uma página interna e um arquivo local.
6. Só depois trocar a instalação usada pelo público.

Usar uma pasta separada torna o retorno recuperável. Não é necessário apagar a versão com problema
nem executar comandos como `git reset --hard`.

## Pendência

A tag `v0.1.0` ainda não existe. O commit `ea530144d5a88653e5534dffcd53a699a4f02d11` é somente uma
referência provisória. Depois da revisão, da CI e do aceite externo, o mantenedor deverá autorizar o
commit e a tag finais; então este procedimento precisa ser ensaiado com essa tag.
