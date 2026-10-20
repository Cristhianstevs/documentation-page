# Etapa 0 — Fundação antes da migração

Status em 2026-10-20: **planejada; ainda não executada por completo**.

A Etapa 0 não instala Next.js, não move o código atual e não cria o editor. Ela registra uma versão
confiável do projeto antes da reforma. Se algo quebrar na migração, teremos uma referência objetiva
para responder três perguntas:

1. O que funcionava antes?
2. O projeto novo ficou melhor, igual ou pior?
3. Como voltamos para a última versão segura?

Pense nesta etapa como fotografar, medir e guardar a planta de uma casa antes de reformá-la.

## 1. O que a Etapa 0 entrega

Ao final, teremos:

- uma revisão exata que representa o tema estático `0.1.0`;
- todos os testes locais verdes nessa revisão;
- uma execução verde da CI remota;
- um teste de aceite realizado por outra pessoa;
- uma instalação fictícia única para comparar a versão antiga e a nova;
- uma lista das URLs e dos comportamentos que não podem quebrar;
- capturas de desktop e celular;
- medidas de desempenho, quantidade de JavaScript e memória;
- um procedimento de retorno para a versão anterior;
- uma decisão registrada autorizando ou recusando o início da Etapa 1.

Isso não é burocracia. Sem essa referência, uma tela “parecida” pode esconder links quebrados,
conteúdo perdido ou uma piora grande de desempenho.

## 2. O que não entra

- Next.js, React ou TypeScript;
- mudanças no formato `config.js` e HTML;
- tema claro/escuro;
- editor visual;
- painel de configurações;
- upload, IA ou chaves de provedores;
- reorganização das pastas atuais de produção.

Se uma tarefa exige qualquer item acima, ela pertence a outra etapa.

## 3. Execução completa

### 0.1 — Fechar o escopo da versão atual

1. Revisar as alterações de documentação ainda não registradas.
2. Executar `npm run validate` em uma árvore limpa.
3. Concluir o teste de aceite externo.
4. Confirmar a CI verde no repositório remoto.
5. Criar o commit e a tag da versão somente após aprovação do mantenedor.

**Evidência:** hash do commit, nome da tag, link da CI e nome/data do teste externo.

Não criarei commit, tag ou release automaticamente. Essas ações mudam o histórico compartilhado e
precisam de autorização explícita.

### 0.2 — Criar a instalação de referência

Usaremos uma documentação pequena, pública e fictícia, igual em todos os testes. Ela precisa conter:

- duas abas;
- pelo menos três páginas;
- títulos repetidos e títulos com acento;
- link entre páginas e link direto para um título;
- tabela, bloco de código, callout, lista de tarefas e toggle;
- imagem local com texto alternativo;
- uma página usada para testar arquivo ausente;
- CSS local simples.

Essa instalação não é a demonstração principal. Ela é uma régua de teste: deve mudar somente quando
o contrato do produto mudar conscientemente.

**Evidência:** fixture em `tests/fixtures/migration/reference-site/`, validada pelos testes.

### 0.3 — Registrar o contrato de compatibilidade

O contrato descreve o que a migração deve preservar:

- URL inicial, URL de aba, página e título;
- recarregar, Voltar, Avançar e abrir em nova aba;
- ordem das abas e páginas;
- IDs estáveis mesmo quando o título visível muda;
- estados vazio, inválido, ausente, negado, servidor e rede;
- clique rápido entre páginas sem resposta antiga sobrescrever a atual;
- teclado, foco, menu móvel e índice;
- isolamento de `site/` durante atualização do tema.

**Evidência:** matriz em `docs/baseline/0.1.0/COMPATIBILIDADE.md` ligando cada regra a um teste.

### 0.4 — Registrar a referência visual

Capturar pelo menos:

- página inicial no desktop;
- catálogo de estilos no desktop;
- página longa no celular;
- menu móvel aberto;
- índice aberto no celular;
- erro de página ausente.

As imagens de referência ficam versionadas porque representam o visual aprovado. Relatórios e
capturas temporárias do Playwright continuam em `test-results/` e `playwright-report/`, ignorados pelo
Git.

**Evidência:** PNGs pequenos em `tests/baselines/0.1.0/screenshots/` e um arquivo explicando navegador,
resolução e rota usada.

### 0.5 — Medir desempenho e memória

Medir sempre com o mesmo computador de referência, navegador, tamanho de tela e instalação. Registrar:

- tamanho total transferido na primeira abertura;
- JavaScript transferido e executado;
- Lighthouse mobile;
- LCP, CLS e tempo de bloqueio disponível no teste;
- tempo para abrir e trocar de página;
- memória aproximada depois de abrir uma página e depois de navegar entre várias.

Memória de navegador varia entre execuções. Por isso, não usaremos um número isolado como verdade;
faremos várias execuções e registraremos a mediana, isto é, o valor central.

**Evidência:** `docs/baseline/0.1.0/DESEMPENHO.md`, incluindo comandos, ambiente e resultados brutos
resumidos. O relatório deve dizer “não medido” quando uma métrica não for confiável, em vez de
inventar precisão.

### 0.6 — Comprovar atualização, backup e retorno

1. Fazer uma cópia autorizada da instalação de referência.
2. Executar o fluxo atual de atualização.
3. Confirmar que `site/` não foi substituído.
4. Restaurar o backup.
5. Comparar a impressão digital dos arquivos antes e depois.
6. Escrever o procedimento de retorno da aplicação para a revisão `0.1.0`.

**Evidência:** testes existentes de atualização e
`docs/baseline/0.1.0/RECUPERACAO.md`.

### 0.7 — Fazer a revisão de saída

Uma pequena reunião ou revisão assíncrona responde:

- todas as evidências existem?;
- há teste vermelho ou comportamento sem registro?;
- as medidas de desempenho são reproduzíveis?;
- sabemos qual revisão restaurar?;
- a Etapa 1 pode começar sem alterar o produto atual?

O resultado é **aprovado** ou **não aprovado**, com motivos. Pendência não vira caixa marcada.

## 4. Arquivos criados pela Etapa 0

Durante esta etapa, a estrutura atual permanece funcionando. Acrescentamos apenas evidências e a
fixture de migração:

```text
documentation-page/
├── index.html                         # aplicação atual; não mover ainda
├── css/                               # estilos atuais; não mover ainda
├── js/                                # comportamento atual; não mover ainda
├── examples/                          # demonstração pública atual
├── site/                              # instalação local; continua ignorada
├── docs/
│   ├── baseline/
│   │   └── 0.1.0/
│   │       ├── README.md              # revisão, ambiente e resumo
│   │       ├── COMPATIBILIDADE.md     # comportamentos que devem sobreviver
│   │       ├── DESEMPENHO.md          # números e forma de medição
│   │       ├── RECUPERACAO.md         # como voltar para a base segura
│   │       └── ACEITE-EXTERNO.md      # resultado de quem testou sem ajuda
│   └── ETAPA-0-FUNDACAO.md            # este plano
├── tests/
│   ├── baselines/
│   │   └── 0.1.0/
│   │       ├── README.md              # resolução, navegador e rotas
│   │       └── screenshots/           # imagens visuais aprovadas
│   └── fixtures/
│       └── migration/
│           └── reference-site/        # conteúdo fictício usado na comparação
├── tools/                              # medidor reproduzível entra aqui, se necessário
└── package.json
```

Não criaremos arquivos vazios apenas para “montar pastas”. Cada item nasce junto com a evidência que
representa.

## 5. Arquitetura de pastas da próxima versão

Esta é a estrutura-alvo. Ela será criada aos poucos, nunca toda de uma vez:

```text
documentation-page/
├── apps/
│   ├── reader/
│   │   ├── app/
│   │   │   ├── [tabId]/
│   │   │   │   └── [pageId]/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── globals.css
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── studio/
│       ├── app/
│       │   ├── api/
│       │   │   ├── site/route.ts
│       │   │   ├── pages/[pageId]/route.ts
│       │   │   ├── import/route.ts
│       │   │   └── ai/
│       │   │       ├── plan/route.ts
│       │   │       └── apply/route.ts
│       │   ├── edit/[pageId]/page.tsx
│       │   ├── settings/page.tsx
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── schemas/
│   │       │   ├── site.ts
│   │       │   ├── document.ts
│   │       │   └── change-set.ts
│   │       ├── ids.ts
│   │       ├── routes.ts
│   │       └── operations.ts
│   ├── content/
│   │   └── src/
│   │       ├── markdown/
│   │       │   ├── parse-markdown.ts
│   │       │   └── serialize-markdown.ts
│   │       ├── legacy/
│   │       │   ├── read-config.ts
│   │       │   └── read-html.ts
│   │       ├── read-site.ts
│   │       ├── write-site.ts
│   │       └── revisions.ts
│   ├── renderer/
│   │   └── src/
│   │       ├── DocumentRenderer.tsx
│   │       └── blocks/
│   ├── ui/
│   │   └── src/
│   │       ├── components/
│   │       ├── styles/
│   │       └── tokens.css
│   ├── editor/                         # nasce na Etapa 2/3
│   │   └── src/
│   │       ├── Editor.tsx
│   │       ├── plugins/
│   │       └── adapters/
│   ├── importers/                      # nasce na Etapa 6
│   │   └── src/
│   │       ├── import-markdown.ts
│   │       ├── import-html.ts
│   │       ├── import-docx.ts
│   │       └── import-pdf.ts
│   └── ai/                             # nasce na Etapa 7
│       └── src/
│           ├── providers/
│           ├── prompts/
│           ├── generate-plan.ts
│           └── validate-plan.ts
├── examples/
│   └── site/                            # demonstração pública no formato novo
├── site/                                # documentos locais do usuário
│   ├── site.json
│   ├── pages/
│   ├── assets/
│   └── custom.css
├── tests/
│   ├── browser/                         # fluxos completos no navegador
│   ├── fixtures/                        # instalações fictícias
│   └── baselines/                       # referências visuais aprovadas
├── tools/                               # criar site, migrar, medir e exportar
├── docs/                                # decisões, guias, planos e evidências
├── package.json                         # comandos comuns e workspaces
└── tsconfig.base.json                   # regras TypeScript compartilhadas
```

Os nomes comuns continuam em minúsculas com hífen. Arquivos que representam componentes React usam
PascalCase, como `DocumentRenderer.tsx` e `Editor.tsx`.

## 6. Como cada parte funciona

### `apps/reader`: a porta de leitura

É o site que o visitante abre. Ele conhece rotas, layout e apresentação, mas não sabe salvar arquivos
nem chamar IA. Assim, continua rápido e pode virar um conjunto de arquivos estáticos.

O nome `app/` vem do Next.js. Cada `page.tsx` representa uma tela. Pastas entre colchetes, como
`[pageId]`, representam uma parte variável do endereço.

### `apps/studio`: a oficina de autoria

É onde o dono da documentação escreve e configura. Suas rotas `api/` recebem pedidos para salvar,
importar ou gerar propostas. O estúdio usa as regras dos pacotes; ele não inventa regras próprias.

Separá-lo do leitor impede que ferramentas pesadas sejam baixadas por quem só quer ler.

### `packages/core`: o livro de regras

Guarda as estruturas e regras mais importantes: o que é uma aba, uma página, um documento, uma URL
e uma alteração permitida. Não conhece React, Next.js, disco ou fornecedor de IA.

Essa independência permite testar as regras rapidamente e reaproveitá-las no leitor, no editor e na
IA sem copiá-las.

### `packages/content`: o bibliotecário

Lê e grava `site.json`, Markdown, assets e revisões. Também contém temporariamente os adaptadores que
entendem `config.js` e HTML antigos.

Somente este pacote conhece detalhes do sistema de arquivos. Isso evita espalhar `readFile` e
`writeFile` por botões, páginas e chamadas da IA.

### `packages/renderer`: o tradutor para leitura

Recebe um documento já validado e cria a página React. Ele não edita e não salva. Por não depender do
editor, o leitor não precisa baixar Lexical.

### `packages/ui`: a caixa de peças visuais

Guarda tokens de cor e espaço e componentes compartilhados, como botão, diálogo e campo. Não guarda
regras de documento. Um botão pode ser usado em vários lugares; a regra “página não pode ter ID
duplicado” pertence ao `core`.

### `packages/editor`: a mesa de escrita

Liga Lexical ao formato do projeto. Plugins e conversores ficam aqui. Só nasce depois que o
experimento comprovar que abrir, digitar e salvar atende aos limites de desempenho.

### `packages/importers`: a recepção de documentos

Cada formato tem um adaptador. Todos devolvem o mesmo documento validado. PDF e DOCX não conhecem a
interface nem escolhem onde salvar.

### `packages/ai`: o planejador

Monta o contexto, chama o provedor e valida o `ChangeSet`. Não grava arquivos. Aplicar uma proposta é
responsabilidade do serviço de conteúdo, depois da aprovação humana.

### `site` e `examples`

`site/` pertence ao usuário e continua ignorado pelo Git do tema. `examples/` pertence ao projeto e
usa somente dados fictícios públicos. Essa separação continua sendo uma regra fundamental.

### `tests`, `tools` e `docs`

- `tests/` comprova comportamentos que atravessam mais de uma parte.
- `tools/` contém comandos de manutenção, não código usado em cada visita ao site.
- `docs/` explica decisões, uso, migração e evidências.

## 7. Regra de dependências

Uma dependência significa “esta parte pode usar aquela”. O fluxo permitido é:

```text
apps/reader ──→ renderer ──→ core
      │             │
      ├──────────→ content ──→ core
      └──────────→ ui

apps/studio ──→ editor ─────→ core
      ├──────→ importers ───→ core
      ├──────→ ai ──────────→ core
      ├──────→ content ─────→ core
      └──────→ ui
```

Regras simples:

1. `core` não importa nenhum outro pacote do projeto.
2. Um pacote nunca importa uma aplicação de `apps/`.
3. `reader` nunca importa `editor`, `ai` ou `importers`.
4. `ai` e `importers` nunca escrevem diretamente em `site/`.
5. Componentes visuais não validam regras que pertencem ao `core`.
6. Toda leitura ou escrita de conteúdo passa por `content`.

Essas regras evitam círculos e tornam claro onde procurar um problema.

## 8. Como a migração acontece sem quebrar a versão atual

### Durante a Etapa 0

A estrutura atual fica intacta. Criamos apenas evidências e a instalação de referência.

### Durante a Etapa 1

Criamos `apps/reader`, `packages/core`, `packages/content`, `packages/renderer` e `packages/ui` ao lado
do código existente. O novo leitor usa o adaptador de compatibilidade para ler o mesmo `config.js` e
os mesmos HTMLs.

Isso permite abrir a versão atual e a nova lado a lado. Não moveremos `index.html`, `css/` ou `js/`
antes de alcançar equivalência.

### Depois da equivalência

Quando rotas, aparência, acessibilidade e desempenho estiverem aprovados:

1. o novo leitor se torna a entrada principal;
2. a revisão `0.1.0` continua disponível no histórico e na tag;
3. o adaptador de HTML permanece durante a transição de conteúdo;
4. arquivos antigos só são removidos em uma mudança separada e reversível.

### Nas etapas seguintes

Cada pasta nasce quando seu recurso começa:

- `editor` nas Etapas 2 e 3;
- APIs de configurações na Etapa 4;
- blocos avançados dentro de `core`, `renderer` e `editor` na Etapa 5;
- `importers` na Etapa 6;
- `ai` na Etapa 7.

## 9. Critério de aceite da Etapa 0

A etapa só pode ser marcada como concluída quando:

- [ ] a revisão `0.1.0` está identificada e recuperável;
- [ ] `npm run validate` está verde nessa revisão;
- [ ] a CI remota está verde;
- [ ] outra pessoa concluiu o teste de aceite ou as falhas foram corrigidas;
- [ ] a instalação de referência existe e contém apenas dados fictícios;
- [ ] a matriz de compatibilidade liga cada regra a uma evidência;
- [ ] capturas de desktop e celular foram registradas;
- [ ] desempenho, JavaScript e memória possuem uma linha de base reproduzível;
- [ ] backup e retorno foram testados;
- [ ] o mantenedor aprovou o início da Etapa 1.

Hoje, a validação local está verde, mas isso não conclui a Etapa 0. Ainda faltam, no mínimo, o teste
externo, a CI remota, as medições, as evidências versionadas e a autorização do mantenedor para
registrar a revisão.

## 10. Primeira sequência de trabalho

Para manter mudanças pequenas:

1. aprovar este desenho;
2. criar somente a instalação de referência e seus testes;
3. registrar a matriz de compatibilidade;
4. automatizar capturas e medições;
5. realizar teste externo e CI;
6. registrar a revisão aprovada;
7. iniciar um experimento mínimo da Etapa 1.

O primeiro pull request da migração não deve conter editor, IA, Markdown novo ou remoção do código
atual.
