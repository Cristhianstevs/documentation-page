# Desempenho do leitor Next.js

Medição local em 2026-10-21, com o Chromium do Playwright no perfil Pixel 5 e a exportação
estática servida com compressão gzip. Os valores são uma referência comparativa, não uma
promessa de velocidade para todos os computadores.

## Resultado central

| Medida                              | Leitor Next.js | Base 0.1.0 |
| ----------------------------------- | -------------: | ---------: |
| JavaScript transferido              |        128 KiB |   36,6 KiB |
| Total transferido                   |        139 KiB |   79,8 KiB |
| Carregamento mediano                |         886 ms |      68 ms |
| LCP mediano do medidor local        |         692 ms |     344 ms |
| Memória JavaScript aproximada       |          10 MB |      10 MB |
| Lighthouse: desempenho              |             64 |         84 |
| Lighthouse: acessibilidade          |            100 |        100 |
| Lighthouse: boas práticas           |             96 |         96 |
| Lighthouse: SEO                     |            100 |         91 |
| Lighthouse: CLS                     |              0 |      0,131 |
| Lighthouse: tempo total de bloqueio |       1.302 ms |     413 ms |

O resultado não permite dizer que a migração melhorou o desempenho. O leitor ficou mais pesado
por carregar o runtime do Next.js e do React, mesmo depois de as interações de menu e tema terem
sido retiradas da hidratação React. Em contrapartida, eliminou o deslocamento visual medido, manteve
acessibilidade 100 e passa a gerar todas as rotas no build.

## Orçamento adotado

O comando `npm run reader:measure` falha se o conjunto de JavaScript compactado ultrapassar 180 KiB.
O build atual possui 175.847 bytes compactados no conjunto de chunks; a página medida transferiu
131.470 bytes de JavaScript. O limite não afirma que esse peso é ideal: ele impede regressão silenciosa
enquanto investigamos como reduzir ou adiar o runtime antes de adicionar o editor.

## Como repetir

```bash
npm run reader:build
npm run reader:measure
npm run reader:lighthouse
```

Os relatórios brutos ficam em `test-results/reader-metrics.json` e
`test-results/lighthouse-reader.json`. A pontuação Lighthouse variou bastante nesta máquina; por isso,
as medianas de cinco execuções são usadas para carregamento e LCP, e uma auditoria isolada não deve
ser usada como prova de melhora.
