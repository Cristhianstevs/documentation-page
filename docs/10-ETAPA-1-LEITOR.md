# Etapa 1 — Migração do leitor

Status em 2026-10-21: **concluída, com ressalva de desempenho documentada**.

O objetivo desta etapa é trocar apenas a parte que apresenta a documentação. O projeto antigo
continua funcionando normalmente enquanto o novo leitor nasce dentro de `apps/reader/`.

Pense nisso como construir uma nova sala ao lado da casa atual. Podemos entrar, testar e comparar a
nova sala sem demolir aquela que ainda está em uso.

## Primeiro incremento entregue

O primeiro incremento cria:

- um workspace npm, que permite manter mais de uma aplicação no mesmo repositório;
- uma aplicação Next.js em `apps/reader/`;
- TypeScript em modo estrito, que avisa sobre vários erros antes de abrir o navegador;
- uma rota estática em `/fundamentos/inicio/`;
- uma página inicial que leva até essa rota;
- um layout mínimo com cabeçalho, aba, menu lateral, conteúdo e índice;
- exportação estática para `apps/reader/out/`;
- testes que protegem as decisões básicas do experimento.

“Workspace” significa somente que o npm entende que o repositório possui partes independentes. O
leitor tem suas próprias dependências e comandos, mas o arquivo `package-lock.json` continua único.
Isso evita versões diferentes da mesma biblioteca espalhadas pelo projeto.

## Segundo incremento: adaptador de compatibilidade

O conteúdo deixou de ser escrito dentro do componente React. O pacote `packages/content` agora lê o
`config.js`, valida as mesmas regras usadas pelo tema atual e abre os HTML cadastrados.

Antes do Next começar, um comando converte apenas a configuração confiável para um JSON temporário.
Isso é necessário porque o empacotador precisa conhecer seus arquivos antecipadamente. O JSON, os
assets e o CSS preparados são gerados novamente a cada build e não entram no Git.

O parser de HTML trabalha somente durante o build. Ele encontra títulos, cria IDs estáveis, preserva
avisos e ajusta caminhos de assets. Ele não faz parte do JavaScript baixado pelo visitante. Como o
HTML legado continua sendo conteúdo de autoria confiável, ele pode ser inserido pelo leitor. Conteúdo
do editor futuro continuará exigindo sanitização antes de chegar a esta etapa.

O build foi comprovado com duas instalações: a demonstração pública, com oito páginas, e a fixture de
migração, com duas abas e três páginas. Nenhum HTML ou `config.js` foi reescrito.

No navegador, também foram verificados o carregamento direto de uma rota, a troca de página pelo
menu, o índice, os assets e a tela de celular. Imagens, vídeos, tabelas e blocos de código largos
ficam limitados à área de leitura; quando necessário, a rolagem acontece dentro do próprio bloco.

## Como executar

Para trabalhar com atualização automática durante o desenvolvimento:

```bash
npm run reader:dev
```

O novo leitor abre em `http://127.0.0.1:4174`. A versão atual continua usando a porta `4173`.

Para conferir os tipos e gerar os arquivos estáticos:

```bash
npm run reader:typecheck
npm run reader:build
```

O resultado estático aparece em `apps/reader/out/` e não é versionado, pois pode ser recriado a
qualquer momento.

## Limites deste incremento

- a demonstração e uma instalação local podem ser geradas, mas ainda usam o formato legado;
- editor, configurações, upload e IA continuam fora desta etapa.

O leitor agora gera todas as rotas cadastradas, converte hashes antigos, reescreve links internos
legados, oferece menu móvel, tema claro/escuro persistente e uma tela de rota inválida. Os fluxos são
verificados no Chromium em desktop e celular contra a exportação estática.

O [relatório de desempenho](11-ETAPA-1-DESEMPENHO.md) registra uma regressão: o runtime Next.js/React
aumentou JavaScript e tempo de bloqueio em relação ao tema `0.1.0`. A etapa é encerrada porque a
equivalência funcional está comprovada, a exceção está explícita e existe um orçamento automatizado.
Reduzir esse custo continua prioritário antes de ampliar o JavaScript público.

Esses itens não são defeitos escondidos. São o limite escolhido para manter a mudança pequena e
permitir uma comparação antes de avançar.
