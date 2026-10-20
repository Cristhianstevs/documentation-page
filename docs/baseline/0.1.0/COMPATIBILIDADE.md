# Contrato de compatibilidade

Esta tabela transforma “a versão nova deve continuar funcionando” em verificações concretas. Quando
o leitor for migrado, executaremos a mesma intenção de teste nos dois leitores.

| Comportamento que deve sobreviver                                    | Evidência atual                     |
| -------------------------------------------------------------------- | ----------------------------------- |
| Abrir a rota inicial e navegar por links reais                       | `tests/browser/navigation.test.mjs` |
| Abrir diretamente uma aba, página ou título e recarregar             | `tests/browser/navigation.test.mjs` |
| Usar Voltar e Avançar sem perder a página                            | `tests/browser/navigation.test.mjs` |
| Mostrar uma mensagem útil para rota ou arquivo inválido              | `tests/browser/navigation.test.mjs` |
| Impedir que um clique antigo e lento substitua o clique mais recente | `tests/browser/navigation.test.mjs` |
| Abrir e fechar menu e índice em tela estreita                        | `tests/browser/navigation.test.mjs` |
| Atualizar a URL ao selecionar ou rolar até um título                 | `tests/browser/navigation.test.mjs` |
| Lidar com títulos repetidos e avisar sobre vários `h1`               | `tests/browser/navigation.test.mjs` |
| Manter código copiável, tarefas e toggles utilizáveis                | `tests/browser/navigation.test.mjs` |
| Rejeitar configurações inválidas e IDs inseguros                     | `tests/config.test.mjs`             |
| Preservar `site/`, CSS e arquivos do usuário numa atualização        | `tests/update.test.mjs`             |
| Manter a fixture com duas abas, três páginas e blocos essenciais     | `tests/baseline.test.mjs`           |

Os caminhos acima são nomes estáveis dentro do repositório. Durante a Etapa 1, cada linha ganhará
também a evidência correspondente do leitor Next.js. Uma linha só poderá ser marcada como compatível
quando os dois lados forem verificáveis.

## Limite conhecido

As capturas atuais revelaram que o menu móvel aberto pode ficar cortado à esquerda. Preservar o
comportamento não significa preservar esse defeito: a migração pode corrigi-lo, desde que haja um
teste novo que prove a melhoria.
