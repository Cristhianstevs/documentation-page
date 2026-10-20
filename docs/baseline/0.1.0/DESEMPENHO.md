# Linha de base de desempenho

Esta medição responde a uma pergunta simples: “quanto o leitor atual custa antes de adicionarmos
Next.js, editor e IA?”. Sem esse número, poderíamos deixar o projeto mais pesado sem perceber.

Foram feitas cinco aberturas da página `#guias/exemplos-praticos` em um servidor local. A tabela usa
a mediana, que é o resultado central e reduz o efeito de uma execução ocasionalmente mais rápida ou
mais lenta.

| Medida                                    |               Resultado | Significado simples                                      |
| ----------------------------------------- | ----------------------: | -------------------------------------------------------- |
| Tempo observado até a página ficar pronta |                  425 ms | Tempo medido pelo comando completo no computador local   |
| Conteúdo do HTML carregado                |                   68 ms | Momento em que o navegador já leu a estrutura da página  |
| Evento de carregamento                    |                   68 ms | Momento em que os recursos locais terminaram de carregar |
| Maior conteúdo visível (LCP)              |                  344 ms | Quando o principal conteúdo apareceu                     |
| Recursos solicitados                      |                      16 | Arquivos usados pela página                              |
| Total transferido                         | 81.750 bytes (79,8 KiB) | Dados recebidos pelo navegador                           |
| JavaScript transferido                    | 37.455 bytes (36,6 KiB) | Parte do total que é JavaScript                          |
| JavaScript após descompressão             | 34.455 bytes (33,6 KiB) | Tamanho aproximado processado pelo navegador             |
| Memória JavaScript aproximada             |                   10 MB | Leitura arredondada fornecida pelo Chromium              |

## Como repetir

Execute:

```bash
npm run baseline:measure
```

O resultado detalhado é criado em `test-results/baseline-metrics.json`. Essa pasta é ignorada pelo
Git porque contém resultados temporários; os números centrais e o método ficam registrados aqui.

## Como interpretar corretamente

O teste usa o próprio computador, sem simular internet lenta. Por isso, os tempos não representam um
celular real numa rede móvel. Eles servem para comparar a versão atual e a futura quando ambas forem
medidas no mesmo ambiente.

A memória informada pelo navegador é aproximada e apareceu arredondada; ela não deve ser tratada
como precisão científica.

## Lighthouse mobile

O Lighthouse 13.5.0 foi executado com perfil móvel e limitação simulada de rede e processador por
meio de:

```bash
npm run baseline:lighthouse
```

| Categoria      | Nota |
| -------------- | ---: |
| Desempenho     |   84 |
| Acessibilidade |  100 |
| Boas práticas  |   96 |
| SEO            |   91 |

As métricas principais foram: FCP de 1.150 ms, LCP de 1.902 ms, tempo total de bloqueio de 413 ms,
CLS de 0,131 e Speed Index de 1.150 ms. O relatório bruto fica temporariamente em
`test-results/lighthouse-baseline.json`.

A nota 84 não reprova a Etapa 0, porque esta etapa registra o ponto de partida. Ela mostra que a
versão Next.js não poderá ser considerada melhor apenas por parecer moderna: deverá reduzir o tempo
de bloqueio e evitar regressão de movimento visual. A meta da arquitetura nova continua sendo pelo
menos 95 em desempenho e acessibilidade.
