# Capturas da linha de base 0.1.0

Estas imagens foram geradas com `npm run baseline:capture`, usando Chromium do Playwright, fontes
externas bloqueadas, desktop de 1440 × 900 e o perfil móvel Pixel 5.

| Arquivo                    | Estado registrado                      |
| -------------------------- | -------------------------------------- |
| `desktop-inicio.png`       | Página inicial no desktop              |
| `desktop-catalogo.png`     | Catálogo de elementos no desktop       |
| `mobile-pagina-longa.png`  | Página longa no celular                |
| `mobile-menu-aberto.png`   | Menu lateral aberto no celular         |
| `mobile-indice-aberto.png` | Índice de títulos aberto no celular    |
| `mobile-rota-invalida.png` | Mensagem para rota inválida no celular |

As imagens usam a demonstração pública de `examples/`, pois ela é o visual completo que os leitores
atuais conhecem. A fixture em `tests/fixtures/migration/reference-site/` é a régua fixa do conteúdo e
dos testes de migração.

Há um defeito visível já registrado: o menu móvel aberto aparece cortado à esquerda. A imagem deve
ser preservada como evidência do estado atual, não como modelo de um defeito que a versão nova precise
repetir.
