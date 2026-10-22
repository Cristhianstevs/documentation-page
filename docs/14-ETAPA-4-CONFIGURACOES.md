# Etapa 4 — Configurações de site, abas e páginas

Status em 2026-10-22: **concluída**.

O estúdio agora altera `site.json` por uma interface local, sem executar configuração como código. A
pessoa ainda pode editar o JSON manualmente: cada operação compara a revisão SHA-256 aberta e recusa
sobrescrever uma mudança externa.

## O que a interface permite

O botão **Configurações** abre um diálogo nativo com quatro áreas:

- **Site:** título, marca, idioma e tema padrão;
- **Abas:** criar, renomear, reordenar e remover abas vazias;
- **Páginas:** criar, renomear, mover, reordenar, duplicar e enviar à lixeira;
- **Lixeira:** restaurar uma página com seu ID, arquivo, aba e posição originais.

O título visível e o ID são campos diferentes. Renomear um título preserva a URL. A alteração de ID
fica em uma seção avançada, mostra um alerta, exige confirmação, renomeia o arquivo e registra um
alias no catálogo.

IDs novos são sugeridos a partir do título, sem acentos, usando letras minúsculas, números e hífen.
A sugestão pode ser ajustada antes da criação. IDs repetidos ou inválidos são recusados no servidor.

## Operações e escrita segura

O navegador não envia um caminho nem substitui livremente o catálogo. Ele envia uma operação pequena
e a revisão aberta, por exemplo:

```json
{
  "revision": "hash-sha-256",
  "operation": {
    "type": "movePage",
    "pageId": "instalacao",
    "tabId": "guias",
    "index": 0
  }
}
```

O servidor valida a operação com Zod, aplica as regras de domínio, valida o catálogo resultante,
confere novamente a revisão imediatamente antes da troca e cria backup em `.revisions/catalog/`.
Criação, renomeação, remoção e restauração de arquivos possuem rollback se o catálogo não puder ser
salvo.

## Lixeira e aliases

Remover uma página move seu arquivo para `.trash/<data>-<pageId>/` e grava um manifesto com título,
aba, posição e caminho originais. A interface pode restaurar esse item. Abas com páginas não podem
ser removidas: primeiro é necessário mover ou remover as páginas, deixando o impacto explícito.

O formato v1 ganhou:

```json
{
  "aliases": {
    "tabs": { "guias-antigos": "guias" },
    "pages": { "comecar": "primeiros-passos" }
  }
}
```

Um alias não pode colidir com um ID ativo e sempre precisa apontar para um destino existente.

## Estados validados

- catálogo vazio continua abrindo o diálogo e permite criar a primeira aba;
- catálogo JSON inválido ou com duplicidades é recusado;
- operação desconhecida, incompleta, ID inválido ou repetido é recusada;
- revisão antiga retorna conflito, sem substituir o `site.json`;
- remoção de aba ocupada é recusada;
- restauração é recusada se o ID original já estiver em uso.

## Como verificar

```sh
npm test
npm run studio:typecheck
npm run studio:build
npm run studio:test:browser
```

Os testes de navegador cobrem criação de aba e página, geração de ID, alias após mudança de URL,
lixeira, restauração, fechamento por `Escape` e largura móvel.

## Limites restantes

- aliases já são armazenados e validados, mas o leitor v1 em Markdown ainda precisa consumi-los
  quando substituir o adaptador legado;
- a lixeira restaura páginas, mas não oferece exclusão definitiva pela interface;
- uma aba não vazia precisa ser esvaziada conscientemente antes da remoção;
- blocos avançados e mídia entram na Etapa 5;
- autenticação e publicação remota continuam fora do estúdio local.
