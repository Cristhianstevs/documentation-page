# Etapa 5 — Blocos avançados e mídia

Concluída em 2026-10-22. Esta etapa amplia o formato Markdown v1, o editor visual e o renderizador
com blocos estruturais e mídia. O leitor continua independente do Tiptap: ele recebe apenas a AST
validada e HTML gerado no servidor.

## Como inserir

No estúdio, abra uma página, escolha **Editar** e use **/ Inserir**. Blocos avançados aparecem como
cartões selecionáveis no modo visual. Use `Alt+Seta para cima` e `Alt+Seta para baixo` para movê-los.
Para alterar conteúdo interno detalhado de tabela, aviso, expansível ou colunas, use a aba
**Markdown**; a prévia mostra o resultado final.

Arquivos locais são copiados para `site/assets/` com um nome aleatório. O servidor aceita somente
PNG, JPEG, GIF, WebP, MP3, OGG, MP4, WebM, PDF e texto, com limite de 25 MB. SVG não entra nesse fluxo
porque pode conter conteúdo ativo e exigiria sanitização própria.

## Catálogo de blocos e configurações

| Bloco      | Configurações disponíveis                                                | Representação                 |
| ---------- | ------------------------------------------------------------------------ | ----------------------------- |
| Parágrafo  | texto, links e marcas                                                    | CommonMark                    |
| Título     | nível 1, 2 ou 3; ID estável no AST                                       | `#`, `##`, `###`              |
| Lista      | ordenada ou marcadores; início da numeração                              | CommonMark                    |
| Tarefas    | marcada ou desmarcada                                                    | GFM                           |
| Citação    | blocos internos                                                          | `>`                           |
| Código     | conteúdo e linguagem                                                     | cerca de crases com linguagem |
| Tabela     | 2–20 linhas na inserção, 2–8 colunas e alinhamento por coluna no formato | GFM                           |
| Divisor    | sem configuração                                                         | `---`                         |
| Imagem     | arquivo/URL, texto alternativo e título opcional                         | Markdown de imagem            |
| Aviso      | tom `info`, `warning` ou `danger`; título opcional; blocos internos      | `:::callout`                  |
| Expansível | título e blocos internos                                                 | `:::toggle`                   |
| Colunas    | 2–4 colunas responsivas; blocos internos e ordem                         | `::::columns`                 |
| Arquivo    | arquivo/URL, rótulo e descrição opcional                                 | `::file`                      |
| Vídeo      | arquivo/URL, título e legenda opcionais                                  | `::video`                     |
| Áudio      | arquivo/URL e título opcional                                            | `::audio`                     |
| Data       | valor ISO `AAAA-MM-DD` e texto exibido opcional                          | `::date`                      |
| Embed      | provedor `figma` ou `miro`, URL HTTPS permitida e título acessível       | `::embed`                     |

Embeds aceitam somente os hosts oficiais `figma.com`, `www.figma.com`, `miro.com` e `www.miro.com`.
Uma URL inválida vira uma mensagem legível, sem criar um `iframe`. O `iframe` permitido usa sandbox,
carregamento tardio e não envia o endereço da página como referência.

## Critérios verificados

- parser, schema, serializador e renderizador cobrem todos os blocos;
- salvar e reabrir preserva a AST, inclusive pelo adaptador Tiptap;
- colunas se adaptam à largura disponível sem depender de animação;
- tabela e mídia larga ficam contidas na área de leitura;
- uploads não escolhem caminhos do sistema e não substituem arquivos existentes;
- o pacote do leitor não importa código do editor.

## Limites conscientes

O cartão visual representa blocos complexos como uma unidade. A edição fina de células e do conteúdo
interno ainda acontece no modo Markdown. Não há transcodificação de áudio/vídeo nem sanitização de
SVG. Figma e Miro continuam sendo embeds por URL; não há sincronização com esses serviços.
