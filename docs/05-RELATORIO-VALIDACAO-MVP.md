# Relatório de validação do MVP

Última validação local: 2026-10-14

Versão preparada: `0.1.0`

Este relatório não valida a arquitetura futura de Next.js, edição ou IA. Esses recursos ainda não
foram implementados e seguem um [plano separado](08-PLANO-PROXIMA-VERSAO.md).

## História validada

Uma instalação define abas e páginas, o navegador valida a URL, carrega o fragmento HTML, gera o índice de títulos e posiciona o trecho solicitado. Atualizar os arquivos do tema não pode substituir `site/`.

## Evidências automatizadas

| Camada                  | Situação | Evidência                                                                                     |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Testes nativos          | Aprovada | 38 testes para criação, documentação, configuração, rotas, páginas, títulos e atualização     |
| Navegador desktop       | Aprovada | 10 cenários: navegação, painéis, URLs, conteúdo, cópia, tarefas e blocos expansíveis          |
| Navegador móvel         | Aprovada | 10 cenários: mesmos fluxos aplicáveis, menus recolhíveis e ausência de corte horizontal       |
| Atualização             | Aprovada | Instalações fictícias `pesca` e `culinaria` mantiveram configuração, páginas e CSS            |
| Backup e reversão       | Aprovada | Cópia restaurada recuperou exatamente a impressão digital SHA-256 do conteúdo original        |
| Formatação              | Aprovada | Biome e Prettier sem divergências; `git diff --check` sem erros                               |
| CI                      | Pendente | Workflow em `.github/workflows/validate.yml`; ainda falta registrar uma execução remota verde |
| Documentação e exemplos | Aprovada | Fluxo único de início, exemplos copiáveis, referências locais e termos revisados              |

O teste da âncora mede a posição do `h2` usando o espaço de rolagem definido pelo tema. No celular, esse espaço também considera a altura do índice fixo.

## Matriz mínima

| Cenário                                         | Cobertura                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| Início, aba, página, título, F5 e histórico     | Navegador automatizado                                                |
| Copiar link e abrir nova aba                    | Links reais verificados no DOM; abertura manual independente pendente |
| Aba/página/título desconhecido                  | Testes nativos e navegador                                            |
| Arquivo ausente, vazio, HTTP 401/403/500 e rede | Testes nativos; 404 também no navegador                               |
| Títulos repetidos, acentuados e explícitos      | Testes nativos                                                        |
| Clique rápido entre páginas                     | Navegador com uma resposta atrasada artificialmente                   |
| Configuração vazia ou inválida                  | Testes nativos                                                        |
| Hospedagem em subpasta                          | Testes nativos de resolução de URL                                    |
| Celular e teclado                               | Navegador móvel automatizado                                          |
| Duas instalações após atualização               | Testes de integração com conteúdo e CSS diferentes                    |
| Ambiente corporativo sem autorização            | Fora do MVP público; depende da Etapa 7                               |

## Inspeção visual

Foram revisadas capturas no perfil Desktop Chrome e no perfil Pixel 5. A nova tipografia, a paleta,
os menus, os estados ativos, o índice, os blocos de código e os avisos ficaram legíveis. No celular,
as abas e os controles continuam acessíveis e não foi observado corte horizontal.

## Pendências externas

- Uma segunda pessoa ainda precisa seguir o [teste de aceite](04-TESTE-DE-ACEITE.md) sem ajuda e registrar dúvidas ou falhas. Automação não substitui essa avaliação de clareza.
- A versão `0.1.0` está preparada, mas não publicada. Criar commit, tag e release é uma ação externa do mantenedor.
- O workflow de CI só terá evidência remota depois que estes arquivos forem enviados ao repositório.
