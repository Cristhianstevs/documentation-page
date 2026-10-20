# Linha de base da versão 0.1.0

Registrada em 2026-10-20. Esta pasta guarda o “antes” da migração: aquilo que a futura versão em
Next.js deverá preservar ou melhorar.

## Estado desta etapa

| Evidência                             | Estado                             |
| ------------------------------------- | ---------------------------------- |
| Instalação fictícia de referência     | Concluída                          |
| Testes locais da instalação           | Concluídos                         |
| Capturas de desktop e celular         | Concluídas                         |
| Medição local de tamanho e velocidade | Concluída                          |
| Lighthouse mobile reproduzível        | Concluído                          |
| Matriz de compatibilidade             | Concluída                          |
| CI remota desta revisão               | Sem execução encontrada            |
| Teste em outra máquina                | Aprovado; ambiente não informado   |
| Commit e tag finais `v0.1.0`          | Autorizados; ainda não registrados |

O commit `ea530144d5a88653e5534dffcd53a699a4f02d11` é a revisão remota encontrada durante este
levantamento. Ele é uma referência provisória, não a tag final da versão. Os arquivos desta linha de
base ainda precisam ser revisados e registrados em um novo commit.

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

## O que ainda impede encerrar a Etapa 0

Ainda faltam a CI remota e o registro da revisão final com uma tag recuperável. O mantenedor aprovou
a conclusão dessas ações, mas a Etapa 1 só estará liberada depois das evidências finais.
