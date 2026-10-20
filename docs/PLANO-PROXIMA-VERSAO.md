# Plano da próxima versão: editor e IA

Criado em 2026-10-20. Este plano começa somente após a base `0.1.0` atual estar preservada em uma
revisão identificável. A [arquitetura](ARQUITETURA.md) define os contratos e a
[pesquisa de tecnologias](PESQUISA-TECNOLOGIAS.md) explica as escolhas.

Uma caixa marcada significa que existe implementação e evidência. Arquitetura aprovada não conta
como funcionalidade entregue.

## Estado atual

- [x] Visão, limites, arquitetura e ordem de execução documentados.
- [x] Bibliotecas candidatas comparadas em fontes oficiais.
- [ ] Migração para Next.js iniciada.
- [ ] Editor visual implementado.
- [ ] Configurações pela interface implementadas.
- [ ] Importação e IA implementadas.

O HTML/CSS/JavaScript atual continua sendo o produto funcional. Não há botão de edição,
configurações, tema ou IA nesta revisão.

## Ordem e dependências

| Etapa | Entrega                                                | Depende de |
| ----- | ------------------------------------------------------ | ---------- |
| 0     | Preservar a base e medir o comportamento atual         | —          |
| 1     | Migrar somente o leitor para Next.js/TypeScript        | 0          |
| 2     | Definir Markdown/AST e validar o editor em experimento | 1          |
| 3     | Entregar edição manual básica                          | 2          |
| 4     | Entregar configurações de abas e páginas               | 3          |
| 5     | Adicionar blocos avançados e mídia                     | 3–4        |
| 6     | Adicionar importação segura de documentos              | 2–5        |
| 7     | Adicionar IA com plano, diff e aprovação               | 4 e 6      |
| 8     | Preparar distribuição e migração estável               | 1–7        |

Cada etapa deve caber em mudanças pequenas. Não começar a próxima enquanto o critério de aceite da
anterior estiver vermelho.

## Etapa 0 — Preservar e medir a base atual

O desenho completo, os arquivos de evidência e a arquitetura de pastas estão em
[Etapa 0 — Fundação antes da migração](ETAPA-0-FUNDACAO.md).

- [ ] Concluir o teste externo e a CI pendentes do MVP atual.
- [ ] Identificar a revisão que representa `0.1.0` antes da migração.
- [ ] Registrar rotas, capturas e resultados dos testes atuais como referência.
- [ ] Medir Lighthouse, JavaScript transferido e memória do leitor atual.
- [ ] Criar uma instalação fictícia usada por todos os testes de migração.

**Aceite:** é possível voltar à versão atual, comparar visualmente e executar seus testes sem depender
do código Next.js.

## Etapa 1 — Migrar somente o leitor

- [ ] Criar npm workspaces apenas com `apps/reader` e os pacotes necessários.
- [ ] Configurar Next.js App Router e TypeScript estrito.
- [ ] Reproduzir header, abas, lateral, conteúdo, índice e comportamento móvel.
- [ ] Implementar rotas `/aba/pagina#titulo` e ponte para os hashes antigos.
- [ ] Ler inicialmente `config.js` e HTML por um adaptador de compatibilidade.
- [ ] Manter exemplos fictícios e `site/` separado.
- [ ] Implementar tema claro/escuro sem incluir editor ou IA.
- [ ] Validar exportação estática do leitor.
- [ ] Medir o orçamento de bundle e Core Web Vitals.

**Não entra:** Markdown novo, editor, configurações, upload ou IA.

**Aceite:** todos os testes de navegação relevantes do MVP passam na aplicação nova; links antigos
abrem o destino novo; a página pública não contém código de autoria; os orçamentos de desempenho são
medidos e não há regressão sem justificativa.

## Etapa 2 — Formato de conteúdo e experimento do editor

- [ ] Definir schemas v1 de `site.json`, AST e diretivas Markdown.
- [ ] Implementar Markdown → AST → renderizador.
- [ ] Implementar adaptador de HTML legado sem converter arquivos automaticamente.
- [ ] Criar conversor explícito com backup e relatório de diferenças.
- [ ] Prototipar Lexical apenas com parágrafo, título, marcas, lista e código.
- [ ] Implementar ida e volta AST ↔ Lexical ↔ Markdown.
- [ ] Testar documento de 5.000 blocos, teclado e perda semântica.
- [ ] Comparar Tiptap somente se Lexical falhar nos critérios registrados.

**Aceite:** salvar um documento sem editar não altera seu significado; o leitor continua sem Lexical;
o experimento atende aos orçamentos ou produz evidência para trocar de editor.

## Etapa 3 — Escrita manual

- [ ] Criar `apps/studio` com runtime Node local.
- [ ] Carregar o editor somente ao clicar em **Editar**.
- [ ] Entregar visual, fonte Markdown e prévia.
- [ ] Adicionar barra, menu `/`, atalhos, desfazer/refazer e links.
- [ ] Adicionar salvar, rascunho local, revisão e conflito otimista.
- [ ] Implementar escrita atômica, backup em `.revisions/` e recuperação.
- [ ] Cobrir teclado, foco, celular e aviso de alteração não salva.

**Aceite:** uma pessoa cria e edita uma página sem tocar em HTML, outra pessoa pode editar o mesmo
arquivo Markdown manualmente, e salvar/recarregar não perde conteúdo.

## Etapa 4 — Configurações sem editar `config.js`

- [ ] Criar diálogo **Configurações** com site, abas e páginas.
- [ ] Criar, renomear, reordenar e mover abas/páginas.
- [ ] Gerar IDs estáveis e alertar antes de alterá-los.
- [ ] Remover para lixeira recuperável, nunca apagar silenciosamente.
- [ ] Criar aliases quando uma URL precisar mudar.
- [ ] Validar catálogo vazio, duplicado, inválido e conflito de revisão.

**Aceite:** o fluxo do teste de aceite que hoje edita `config.js` pode ser concluído pela interface,
sem perder a possibilidade de edição manual de `site.json`.

## Etapa 5 — Blocos avançados e mídia

Entregar em lotes, cada um com serialização, teclado, leitura móvel e teste de round-trip:

- [ ] Lote A: tabela, callout, toggle e divisor.
- [ ] Lote B: colunas responsivas e reordenação acessível.
- [ ] Lote C: imagens e arquivos locais com texto alternativo.
- [ ] Lote D: vídeo, áudio, data e bloco de código com linguagem.
- [ ] Lote E: embeds permitidos de Figma e Miro.

**Aceite:** nenhum lote aumenta o JavaScript inicial do leitor; conteúdo continua compreensível sem
animação e em tela estreita.

## Etapa 6 — Importação segura

- [ ] Criar pipeline comum de upload, limites, timeout e cancelamento.
- [ ] Importar Markdown e texto.
- [ ] Importar HTML permitido para AST, sem inserir HTML bruto.
- [ ] Importar DOCX no servidor e mostrar avisos de conversão.
- [ ] Extrair PDF e avisar sobre perda de ordem/tabelas.
- [ ] Importar exportação do Notion em arquivo, sem OAuth.
- [ ] Mostrar prévia editável antes de criar qualquer página.
- [ ] Testar arquivo grande, corrompido, tipo falso e conteúdo malicioso.

**Aceite:** upload nunca define sozinho o caminho ou sobrescreve uma página; a pessoa vê o conteúdo
normalizado e escolhe o destino antes de salvar.

## Etapa 7 — IA com controle humano

- [ ] Criar painel/modal de chat carregado sob demanda.
- [ ] Implementar o formulário obrigatório de aba, página, ação e preservação.
- [ ] Adicionar configuração de provedor e chave temporária no servidor.
- [ ] Implementar AI SDK atrás de uma interface interna.
- [ ] Gerar `ChangeSet` estruturado e validado por Zod.
- [ ] Limitar operações ao escopo escolhido; não oferecer exclusão à IA.
- [ ] Mostrar diff por aba, página e seção.
- [ ] Oferecer aceitar, editar ou descartar antes de aplicar.
- [ ] Aplicar em transação com backup e relatório.
- [ ] Testar prompt injection em documento, resposta inválida, timeout e custo excedido.

**Aceite:** pressionar Enter nunca modifica arquivo diretamente; toda mudança passa por escopo,
schema, prévia e confirmação explícita.

## Etapa 8 — Distribuição e migração

- [ ] Criar comando de migração que só altera uma cópia/backup por padrão.
- [ ] Documentar atualização de HTML/config.js para Markdown/site.json.
- [ ] Gerar pacote estático apenas do leitor.
- [ ] Validar Windows, macOS e Linux nos comandos suportados.
- [ ] Criar instalação do zero e atualizar uma instalação antiga.
- [ ] Executar auditoria de dependências e licenças.
- [ ] Executar testes de desempenho, acessibilidade e navegador.
- [ ] Obter teste de aceite por outra pessoa.

**Aceite:** um usuário novo baixa, cria uma documentação, edita, exporta e restaura um backup seguindo
somente o guia; uma instalação antiga migra sem perder URLs ou arquivos.

## Fora desta versão

- contas de usuário;
- login e SSO;
- colaboração simultânea;
- comentários com autores;
- sincronização ao vivo com Notion, Figma ou Miro;
- banco remoto obrigatório;
- publicação automática;
- IA autônoma com permissão de excluir ou publicar.

## Próxima mudança recomendada

Executar somente a **Etapa 0**. Depois, criar um pequeno experimento da Etapa 1 com uma página e uma
rota, medir o bundle e comparar o HTML gerado. Não mover todo o código nem instalar o editor no mesmo
pull request.
