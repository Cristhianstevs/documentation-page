# Linha de base da versão 0.1.0

Registrada em 2026-10-20. Esta pasta guarda o “antes” da migração: aquilo que a futura versão em
Next.js deverá preservar ou melhorar.

## Estado desta etapa

| Evidência                             | Estado                           |
| ------------------------------------- | -------------------------------- |
| Instalação fictícia de referência     | Concluída                        |
| Testes locais da instalação           | Concluídos                       |
| Capturas de desktop e celular         | Concluídas                       |
| Medição local de tamanho e velocidade | Concluída                        |
| Lighthouse mobile reproduzível        | Concluído                        |
| Matriz de compatibilidade             | Concluída                        |
| CI remota da linha de base            | Aprovada                         |
| Teste em outra máquina                | Aprovado; ambiente não informado |
| Commit da linha de base               | `82e1ed2`                        |
| Tag final                             | `v0.1.0`                         |

O commit `82e1ed2b11c3eeed96ffca9c8331d884cc7103c9` registrou a linha de base. Sua validação remota
passou na [execução 39516158936](https://github.com/Cristhianstevs/documentation-page/actions/runs/39516158936).
O fechamento documental posterior pertence à mesma Etapa 0 e a tag `v0.1.0` identifica o resultado
completo.

## Ambiente usado

- Windows, em servidor HTTP local;
- Node.js 24.14.1;
- npm 11.12.1;
- Chromium fornecido pelo Playwright;
- tela de celular simulada pelo perfil Pixel 5;
- fontes externas bloqueadas para a medição depender somente do projeto local.

## O que criamos

A instalação pequena e fictícia vive em
`tests/fixtures/migration/reference-site/`. Ela contém duas abas, três páginas e exemplos dos
elementos importantes. Seu objetivo não é ser uma documentação bonita: ela funciona como uma régua
que será usada tanto no projeto atual quanto no novo.

As capturas estão em `tests/baselines/0.1.0/screenshots/`. Elas registram a demonstração pública
atual, enquanto a fixture registra o contrato de conteúdo. Essa diferença é intencional e está
explicada no README das imagens.

## Descoberta importante

A captura do menu aberto no celular mostra conteúdo cortado no lado esquerdo. Não corrigimos isso
silenciosamente nesta etapa, pois o objetivo agora é registrar com honestidade como a versão atual se
comporta. A correção pode entrar em uma mudança pequena e separada.

## Encerramento

A linha de base local, o Lighthouse, o teste em outra máquina e a CI remota foram concluídos. A tag
`v0.1.0` torna essa versão recuperável. Começar a Etapa 1 continua sendo uma decisão separada do
mantenedor.
