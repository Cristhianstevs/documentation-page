# Pesquisa de tecnologias para editor, interface e IA

Pesquisa realizada em 2026-10-20 nas documentações e repositórios oficiais. Este documento explica
as escolhas; não afirma que as bibliotecas já estão instaladas.

## Critérios

As opções foram comparadas por:

- peso enviado ao leitor e possibilidade de carregamento sob demanda;
- acessibilidade e suporte a teclado;
- qualidade do modelo de documento e extensibilidade;
- suporte a TypeScript e React;
- licença compatível com um projeto público e genérico;
- possibilidade de manter arquivos locais e trocar de provedor;
- esforço real para títulos, listas, tabelas, código, colunas, toggles e mídia.

Popularidade não é critério suficiente. Uma biblioteca com muitos recursos prontos pode aumentar o
bundle, a memória e o acoplamento justamente onde o projeto quer ser pequeno.

## Editor de texto

| Opção                                                             | Pontos fortes                                                                                                                                          | Limites para este projeto                                                                                                             | Decisão                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Lexical](https://lexical.dev/docs/intro)                         | Núcleo pequeno sem dependências, plugins opcionais, modelo imutável, React oficial, HTML/Markdown/JSON e foco declarado em acessibilidade e desempenho | A interface e blocos como colunas precisam ser construídos; exige aprender sua arquitetura                                            | **Escolha inicial**, condicionada ao experimento de round-trip e desempenho |
| [Tiptap](https://tiptap.dev/docs/editor/getting-started/overview) | API madura sobre ProseMirror, modular, headless, muitas extensões e núcleo MIT                                                                         | Alguns recursos avançados, como comentários e histórico, pertencem à oferta paga; é fácil instalar mais extensões do que o necessário | Melhor alternativa se Lexical tornar os blocos complexos caros demais       |
| [BlockNote](https://www.blocknotejs.org/docs)                     | Experiência de blocos próxima de editores conhecidos, tabelas, embeds e boa configuração inicial                                                       | Traz mais opinião e interface pronta; núcleo usa MPL 2.0; menor controle sobre o peso inicial                                         | Bom para protótipo, não é a base recomendada para o produto leve            |
| [Plate](https://platejs.org/docs)                                 | Grande conjunto de plugins, UI copiável, IA e recursos avançados                                                                                       | Superfície ampla e mais decisões prontas; a própria documentação mostra custos relevantes em documentos de 10 mil blocos              | Referência de funcionalidades; não adotar antes de benchmark comparável     |

Lexical não será enviado ao leitor. O leitor renderiza a AST do projeto no servidor; Lexical só é
importado quando a pessoa abre o modo de edição. Isso pesa mais na decisão que uma comparação isolada
de tamanho entre pacotes.

## Blocos e recursos editoriais

| Recurso                                | Estratégia inicial                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| Títulos, parágrafos e listas           | Nós e plugins oficiais do Lexical, mapeados para CommonMark/GFM                            |
| Negrito, itálico, sublinhado e tachado | Marcas inline do editor e Markdown quando houver representação                             |
| Tabelas                                | Plugin de tabela após o núcleo de edição; serialização GFM                                 |
| Código                                 | Bloco próprio; destaque no servidor/build para não carregar o highlighter no leitor        |
| Divisor                                | Nó simples mapeado para `---`                                                              |
| Toggle                                 | Nó próprio mapeado para uma diretiva e renderizado como `details/summary`                  |
| Duas ou mais colunas                   | Container validado com CSS Grid; no celular vira uma coluna                                |
| Data                                   | Bloco/inline semântico com ISO no arquivo e rótulo localizado na interface                 |
| Calendário                             | Campo nativo de data primeiro; calendário complexo somente com necessidade comprovada      |
| Citação e callout                      | Citação nativa e diretiva de callout com tipo textual, não apenas cor                      |
| Imagem, vídeo e áudio                  | Arquivo local em `site/assets/`, metadados e elemento HTML nativo                          |
| Atalhos e menu `/`                     | Comandos do editor e um menu acessível carregado com o estúdio                             |
| Comentários                            | Fora da primeira atualização; exigem identidade, âncoras estáveis e resolução de conflitos |

Comentários não devem ser simulados como texto colorido. Uma anotação de revisão precisa de autor,
estado, trecho ancorado e comportamento quando o texto é editado; isso depende do sistema de contas
que foi adiado.

## Interface e design system

### Radix Primitives

[Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) é headless e pode
ser adotado componente por componente. A documentação cobre foco, teclado e padrões WAI-ARIA. A
recomendação é começar apenas com `Dialog`, `DropdownMenu`, `Tooltip`, `Popover` e `Tabs`.

Não adotaremos uma biblioteca visual inteira. Os tokens atuais de cor, espaço, tipografia e borda
migram para CSS custom properties. Componentes do projeto aplicam a aparência sobre os primitivos.
Isso mantém o tema genérico e evita que cada atualização externa redesenhe a interface.

`shadcn/ui` pode servir como referência e fonte de componentes copiáveis, mas não será uma
dependência arquitetural. Copiar um componente também transfere sua manutenção para o projeto.

### Ícones

[Lucide](https://lucide.dev/guide/packages/lucide-react) é a opção inicial por oferecer componentes
SVG e importação por ícone. Ícones sempre acompanham rótulo ou nome acessível; não carregam sozinhos
o significado de excluir, salvar ou gerar com IA.

## Animações

Transições de hover, foco, abertura simples e skeleton usam CSS. Para reordenação, presença de modal
ou transições que realmente se beneficiem de física, usar
[Motion com `LazyMotion`](https://motion.dev/docs/react-lazy-motion). A própria documentação mostra
que carregar as funções sob demanda reduz muito o pacote inicial em comparação com o componente
completo.

Regras:

- nenhuma animação é requisito para concluir uma ação;
- `prefers-reduced-motion` remove movimento não essencial;
- não animar altura de documentos grandes a cada digitação;
- não instalar Motion antes de existir um caso que CSS não resolva bem;
- medir tarefas longas durante arrastar blocos e abrir diálogos.

## Arrastar e ordenar

Na primeira versão, botões **Mover para cima/baixo** e atalhos de teclado acompanham qualquer
reordenação por arraste. Uma biblioteca de drag and drop só entra no experimento do editor. O
critério é suportar teclado, touch e listas longas sem rerenderizar todo o documento.

Essa decisão evita adicionar uma dependência somente para produzir um efeito visual. Reordenar abas
e páginas é possível sem arrastar; acessibilidade e previsibilidade vêm antes.

## Markdown, HTML e destaque de código

O pipeline recomendado é `unified` com `remark-parse`, `remark-gfm`, `remark-directive`, `rehype` e
uma camada própria de validação. Apenas plugins necessários serão instalados. HTML cru fica desligado
por padrão.

Para código, [Shiki](https://shiki.style/guide/) pode gerar HTML destacado no servidor ou no build.
Como o leitor recebe o resultado pronto, não paga o custo do highlighter no navegador. O experimento
deve medir tempo de build e quantidade de linguagens carregadas; somente linguagens configuradas
entram no pacote.

## IA

O [AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/overview) oferece uma interface comum para provedores,
streaming, ferramentas e saída estruturada. O projeto usará saída validada por schema para gerar um
`ChangeSet`, nunca texto HTML pronto nem comandos livres de arquivo.

O SDK não decide segurança ou autorização. O domínio continua responsável por:

- limitar abas, páginas e seções permitidas pelo formulário;
- validar IDs, operações e tamanho;
- calcular o diff;
- pedir aprovação;
- aplicar backup e escrita atômica.

Provedores locais compatíveis podem ser adicionados pelo mesmo contrato. A presença do AI SDK não
obriga usar Vercel, um modelo específico ou uma conta paga.

## Importação de documentos

| Origem       | Primeira abordagem                                                                                            | Observação                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Word `.docx` | [Mammoth](https://github.com/mwilliamson/mammoth.js) no servidor, seguido de sanitização e conversão para AST | O projeto avisa que não sanitiza HTML e que documentos complexos perdem fidelidade; versão deve ser fixada e auditada          |
| PDF          | `pdfjs-dist`/PDF.js em worker no servidor para extração de texto                                              | PDF guarda layout, não necessariamente a ordem semântica; sempre mostrar prévia                                                |
| Markdown/TXT | Parser direto                                                                                                 | Caminho mais fiel e leve                                                                                                       |
| HTML         | Parser com allowlist para a AST                                                                               | Nunca renderizar a entrada bruta                                                                                               |
| Notion       | Exportação Markdown/CSV/HTML                                                                                  | A [exportação oficial](https://www.notion.com/help/export-your-content) evita OAuth no primeiro passo                          |
| Figma        | Bloco de embed permitido                                                                                      | O [Embed Kit](https://developers.figma.com/docs/embeds/) mantém o arquivo no Figma; não equivale a importar conteúdo editável  |
| Miro         | Live Embed permitido                                                                                          | O [Live Embed](https://developers.miro.com/docs/miro-live-embed-introduction) usa iframe; conexão e permissões são outra etapa |

Importadores são adaptadores opcionais do servidor. Eles não entram no bundle público e podem ser
desativados por configuração.

## Next.js e os dois modos de execução

O [App Router](https://nextjs.org/docs/app) permite usar Server Components para o leitor e Client
Components somente nas ilhas interativas. A documentação oficial também confirma que uma
[exportação estática](https://nextjs.org/docs/app/guides/static-exports) pode ser hospedada em um
servidor de arquivos, mas não suporta recursos dinâmicos como Server Actions e operações `POST`.

Essa limitação fundamenta a separação:

- `reader` pode ser exportado estaticamente;
- `studio` usa runtime Node e possui as mutações;
- conteúdo e renderização são pacotes compartilhados;
- publicar `reader` não publica acidentalmente as APIs de autoria.

## Decisão e condição de reversão

Adotar inicialmente Next.js, Lexical, Radix e AI SDK. Antes de construir a barra completa do editor,
o experimento precisa comprovar:

1. página pública sem código do editor;
2. abrir e salvar Markdown sem perda semântica;
3. documento de 5.000 blocos dentro do orçamento de digitação;
4. acessibilidade básica com teclado;
5. bundle do leitor dentro do orçamento definido na arquitetura.

Se Lexical falhar nos itens 2 a 4, comparar o mesmo protótipo em Tiptap. Se Next.js falhar no item 1
ou 5 mesmo com Server Components e exportação estática, reavaliar o leitor antes de migrar o restante.
Trocar cedo num experimento custa pouco; trocar depois de dezenas de blocos personalizados custa
muito.
