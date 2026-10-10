# Relatório de validação do MVP

Data: 2026-10-09  
Versão preparada: `0.1.0`

## História validada

Uma instalação define abas e páginas, o navegador valida a URL, carrega o fragmento HTML, gera o índice de títulos e posiciona o trecho solicitado. Atualizar os arquivos do tema não pode substituir `site/`.

## Evidências automatizadas

| Camada                                 | Situação  | Evidência                                                                                        |
| -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| Configuração, rotas, páginas e títulos | Aprovada  | 33 testes existentes mais 2 testes de atualização/reversão; total de 35                          |
| Navegador desktop                      | Aprovada  | Link direto, F5, histórico, rota/título inválidos, 404 e resposta atrasada                       |
| Navegador móvel                        | Aprovada  | Mesmos fluxos, menu por teclado, índice recolhível e ausência de corte horizontal                |
| Atualização                            | Aprovada  | Instalações fictícias `pesca` e `culinaria` mantiveram configuração, páginas e CSS               |
| Backup e reversão                      | Aprovada  | Cópia restaurada recuperou exatamente a impressão digital SHA-256 do conteúdo original           |
| Formatação                             | Aprovada  | Biome e Prettier sem divergências; `git diff --check` sem erros                                  |
| CI                                     | Preparada | Workflow em `.github/workflows/validate.yml`; execução remota ocorrerá após envio ao repositório |

O teste da âncora mede a posição do `h2`: no desktop, a borda do título fica afastada do topo pelo mesmo valor de `margin-top`; no celular, soma-se a altura do índice fixo.

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

Foram revisadas capturas em `1424 × 805` e no perfil Pixel 5. O título “Pré-requisitos” aparece abaixo do topo pelo espaço de sua margem; no celular permanece abaixo do índice fixo. Não foi observado corte horizontal.

## Pendências externas

- Uma segunda pessoa ainda precisa seguir o guia sem ajuda e registrar dúvidas ou falhas. Automação não substitui essa avaliação de clareza.
- A versão `0.1.0` está preparada, mas não publicada. Criar commit, tag e release é uma ação externa do mantenedor.
- O workflow de CI só terá evidência remota depois que estes arquivos forem enviados ao repositório.
