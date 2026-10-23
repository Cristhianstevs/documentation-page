# Etapa 6 — Importação segura

Iniciada em 2026-10-22 e concluída em 2026-10-23. A etapa foi entregue em lotes para que cada
formato tivesse limites, avisos de conversão e testes próprios.

## Primeiro lote: Markdown e texto

O estúdio agora possui a ação **Importar**. Ela aceita um arquivo `.md`, `.markdown` ou `.txt` de
até 1 MiB e produz uma prévia normalizada. A pessoa pode editar o Markdown, conferir o resultado
renderizado e escolher entre criar uma página ou substituir todo o conteúdo de uma página
cadastrada.

O pipeline comum:

1. confere o tamanho declarado antes de interpretar o formulário;
2. compara a extensão com o tipo informado pelo navegador;
3. recusa conteúdo vazio, binário ou UTF-8 inválido;
4. converte o conteúdo para o AST validado do projeto;
5. devolve Markdown normalizado, avisos e HTML produzido pelo renderizador seguro;
6. permite cancelamento e aplica um limite de 10 segundos na interface;
7. exige destino e confirmação antes de gravar;
8. usa revisão, backup e escrita atômica dos repositórios existentes.

Texto simples vira parágrafos e recebe um aviso de simplificação. Markdown passa pelo mesmo parser
e pelo mesmo schema usados pelo editor. A rota de prévia não recebe `pageId`, caminho ou revisão;
portanto, um upload não consegue escolher um destino sozinho. A escrita acontece somente depois,
por uma operação separada e confirmada.

## Como experimentar

```sh
npm run create-studio-site
npm run studio:dev
```

Abra `http://127.0.0.1:4176`, selecione **Importar** e escolha um arquivo Markdown ou texto fictício.
Confira a mensagem de que nenhum arquivo foi alterado, edite o Markdown, escolha o destino e leia o
aviso de impacto antes de confirmar.

## Outros formatos concluídos

- **HTML:** converte somente elementos permitidos para AST e descarta scripts, iframes, estilos e
  endereços perigosos;
- **DOCX:** usa Mammoth somente no servidor, remove imagens incorporadas e avisa que a aparência,
  tabelas, listas e notas podem exigir revisão;
- **PDF:** usa PDF.js no servidor, separa o texto por página e avisa sobre possível perda de ordem,
  colunas, tabelas e imagens;
- **Notion:** abre uma exportação ZIP sem OAuth, prefere `index.md`/`index.html` e avisa que links e
  anexos precisam ser revisados.

Uploads binários aceitam até 10 MiB. ZIPs também possuem limite de entradas e tamanho expandido.
Arquivo grande, corrompido, com tipo falso ou conteúdo malicioso possui cobertura automatizada.

OCR, importação de imagens do DOCX/PDF e sincronização ao vivo com Notion permanecem fora desta
etapa. Eles exigem contratos próprios e não bloqueiam o aceite da importação documental inicial.
