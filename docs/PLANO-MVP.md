# Plano para concluir o MVP

Criado em 2026-09-27 a partir da [revisão do projeto](DIAGNOSTICO.md). Este documento é uma fila de entregas, não uma promessa de prazo. Caixas marcadas indicam somente trabalho já concluído.

## Resultado que queremos

Um autor configura os assuntos, cadastra páginas e escreve HTML. O site monta os três níveis de navegação, permite compartilhar um trecho e recebe atualizações do tema sem substituir o conteúdo local.

Exemplo de validação: criar a aba fictícia “Pesca”, cadastrar “Equipamentos”, escrever títulos e enviar o link de “Varas”. Outra pessoa abre esse link e vê a aba, a página e o trecho corretos.

Há dois marcos diferentes: o **MVP do tema público**, com exemplos fictícios, e o **piloto corporativo**, que só pode usar dados internos depois de validar controle de acesso e backups.

## Ordem e dependências

| Etapa | Entrega                                         | Depende de                     |
| ----- | ----------------------------------------------- | ------------------------------ |
| 0     | Diagnóstico e acordos de trabalho               | —                              |
| 1     | Separação entre tema e instalação               | 0                              |
| 2     | Configuração consistente e exemplos utilizáveis | 1                              |
| 3     | URLs de abas e páginas                          | 2                              |
| 4     | Índice e URLs de títulos                        | 3                              |
| 5     | Estilos de conteúdo, celular e acessibilidade   | 4                              |
| 6     | Validação, atualização e primeira release       | 1–5                            |
| 7     | Piloto corporativo protegido                    | 6 + infraestrutura empresarial |

A definição de hospedagem/login pode ser estudada desde o início pelo responsável corporativo. A integração final depende do contrato de instalação. Cada etapa deve virar mudanças pequenas, preferencialmente uma funcionalidade verificável por revisão.

## Etapa 0 — Entender a base e registrar o plano

- [x] Ler código, conteúdo e configurações.
- [x] Verificar o fluxo básico e falhas de navegação no navegador.
- [x] Registrar diagnóstico, arquitetura proposta, guia de uso e histórico de alterações.
- [x] Criar orientações de trabalho em `AGENTS.md`.
- [ ] Escolher licença e política inicial de versões antes de distribuir o tema.

**Aprendizado:** requisito é uma necessidade; critério de aceite é uma forma observável de provar que ela foi atendida.

## Etapa 1 — Separar tema, exemplos e instalação

- [x] Criar `examples/` com configuração, páginas e personalização fictícias.
- [x] Criar o contrato de `site/config.js`, `site/pages/`, `site/assets/` e `site/custom.css`.
- [x] Ignorar `site/` no Git do tema antes de colocar conteúdo de uma instalação ali.
- [x] Adaptar o carregamento para resolver uma configuração única, compartilhada pelos componentes.
- [x] Diferenciar “instalação ausente” de “instalação inválida”, sem fallback silencioso que esconda erros.
- [x] Separar versão do tema e identidade do site; tornar nome/logo configuráveis conforme necessário.
- [x] Documentar a migração dos caminhos antigos e preservar links de página existentes.

Concluída em 2026-09-30. Evidências: 13 testes nativos e verificação no Edge dos modos demonstração/local, configuração inválida, HTTP 403/500, CSS local, links antigos, F5, histórico e caminhos em subpasta. Uma instalação fictícia com aba `rotina` funcionou sem alterar componentes. Os exemplos vazios/ausentes continuam na Etapa 2.

**Aceite:** uma instalação fictícia pode ser criada sem editar componentes; a demonstração continua funcionando sem `site/`; arquivos locais não são rastreados; o autor continua precisando apenas de configuração e páginas para conteúdo textual.

**Aprendizado:** separação de responsabilidades e contrato público. Um contrato é aquilo que outro código ou pessoa pode usar sem conhecer todos os detalhes internos.

## Etapa 2 — Tornar configuração e conteúdo previsíveis

- [ ] Definir `id` estável da página, com compatibilidade para o cadastro atual por `file`.
- [x] Validar formato, IDs repetidos, campos obrigatórios e associação de página à aba.
- [x] Tratar configuração vazia e abas vazias.
- [ ] Completar ou remover as duas páginas inexistentes e as duas vazias da demonstração.
- [ ] Padronizar HTML como fragmento e eliminar o contêiner duplicado.
- [ ] Conferir links, imagens e exemplos de instalação.
- [x] Definir caminhos de imagens relativos ao documento principal e manter esse contrato no guia.

**Aceite:** nenhuma página anunciada na demonstração termina vazia ou ausente; configuração errada informa o campo problemático; adicionar um assunto não exige escrever seu nome dentro de `main.js`.

**Aprendizado:** fonte única de dados, validação e mensagens de erro úteis.

## Etapa 3 — Concluir URLs de abas e páginas

- [ ] Criar leitura e resolução de rota independentes da renderização.
- [x] Gerar `href` real nos menus.
- [ ] Definir primeira página ao entrar numa aba e comportamento inicial a partir da configuração.
- [ ] Atualizar conteúdo, menus ativos, título do navegador e foco pela mesma rota.
- [x] Resolver F5, link direto, mudança manual do fragmento e Voltar/Avançar pela URL.
- [x] Manter URLs antigas `#aba/pagina` funcionando.
- [ ] Mostrar estados de carregamento, vazio, rota inválida e falha de rede/arquivo.
- [x] Cancelar ou descartar respostas de navegações anteriores.
- [ ] Preservar copiar link, abrir em nova aba e cliques com Ctrl/Cmd.

**Aceite:** qualquer página cadastrada abre numa janela nova pelo link, sobrevive a F5 e ao histórico. A última página clicada continua sendo a escolhida mesmo que uma resposta anterior chegue depois.

**Aprendizado:** URL como estado reproduzível, eventos do navegador e operações assíncronas.

## Etapa 4 — Criar o índice da direita e links de títulos

- [ ] Implementar `AppToc` e registrá-lo.
- [ ] Extrair `h1`, `h2` e `h3` apenas do conteúdo carregado.
- [ ] Gerar IDs legíveis, preservando IDs explícitos e evitando colisões.
- [ ] Representar níveis e ordem corretamente.
- [ ] Adicionar o segmento de título `#aba/pagina/titulo`.
- [ ] Ir ao título depois que a página estiver disponível, inclusive no link direto.
- [ ] Destacar a seção em leitura sem encher o histórico a cada movimento de rolagem.
- [ ] Tratar página sem títulos e título solicitado que não existe.
- [ ] Manter navegação de título na mesma página sem buscar o HTML novamente.

**Aceite:** títulos acentuados, repetidos e com ID manual geram destinos válidos. Copiar um link de título, abrir em outra janela e recarregar mantém o ponto correto. Renomear o texto com ID explícito preserva o endereço.

**Aprendizado:** DOM, normalização de texto, identidade estável e observação de rolagem.

## Etapa 5 — Criar o padrão visual de conteúdo

- [ ] Preencher `content.css` com títulos, parágrafos, listas, links, citações e divisórias.
- [ ] Estilizar código em linha e blocos de código, tabelas, imagens e legendas.
- [ ] Criar avisos de informação, atenção e perigo com texto/ícone, sem depender apenas da cor.
- [ ] Criar uma página de catálogo que mostre todos os padrões suportados.
- [ ] Definir largura de leitura, espaçamento e contraste.
- [ ] Tornar cabeçalho e lateral utilizáveis no celular; índice recolhível em tela estreita.
- [ ] Verificar foco visível, navegação por teclado, nomes acessíveis e movimento reduzido.
- [ ] Remover ou implementar os botões sem ação; não deixar uma função anunciada como pronta quando não está.

**Aceite:** ler e navegar em 390 px e numa tela ampla sem conteúdo cortado; tabelas/código podem ter rolagem própria; menus acessíveis por teclado; alterações de CSS local não exigem editar o tema.

**Aprendizado:** HTML semântico, design tokens, cascata do CSS, responsividade e acessibilidade.

## Etapa 6 — Garantir qualidade e preparar distribuição

- [ ] Criar comandos reproduzíveis para servir, formatar e validar, fixando versões se forem adicionadas ferramentas locais.
- [ ] Simplificar as recomendações de editor para as ferramentas realmente usadas.
- [ ] Adicionar testes de interpretação de rotas, validação do catálogo e geração de IDs.
- [ ] Automatizar os fluxos críticos de navegador quando a navegação estiver consolidada.
- [ ] Executar a matriz manual abaixo com o amigo e registrar resultados.
- [ ] Simular atualização em duas instalações fictícias, com conteúdo e CSS diferentes.
- [ ] Confirmar conteúdo preservado e links antigos válidos após a atualização.
- [ ] Ensaiar backup, migração e reversão usando somente dados fictícios.
- [ ] Registrar changelog, guia de uso/migração e uma revisão publicada identificável.
- [ ] Configurar verificações automáticas no repositório quando os comandos locais existirem.

**Aceite:** uma pessoa seguindo o guia consegue instalar, cadastrar conteúdo, receber a atualização e recuperar a versão anterior. Sem referência quebrada na demonstração e sem regressão nos fluxos críticos.

**Aprendizado:** teste unitário verifica uma regra isolada; teste de integração verifica partes combinadas; teste de navegador verifica a jornada real. CI executa verificações automaticamente a cada mudança.

## Etapa 7 — Validar o piloto corporativo

- [ ] Confirmar com a TI o ambiente, mecanismo de identidade, perfis e política de armazenamento.
- [ ] Implementar a integração fora do núcleo do tema.
- [ ] Proteger entrega de HTML, configuração interna, anexos e APIs no servidor/gateway.
- [ ] Testar acesso direto sem sessão, sessão expirada, logout e usuário sem permissão.
- [ ] Definir backups autorizados e demonstrar restauração.
- [ ] Importar primeiro um pequeno conjunto de documentos revisados, com responsável e data de revisão.
- [ ] Testar localização da informação com usuários reais antes de migrar todos os documentos.
- [ ] Definir a fonte oficial durante a migração para evitar duas cópias contraditórias.

**Aceite:** documentos não são obtidos sem autorização; a equipe encontra a informação; atualização do tema preserva o conteúdo. A aprovação desse ambiente depende dos responsáveis da empresa, não apenas do autor do tema.

## Matriz mínima de validação

| Cenário                                        | Resultado esperado                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Início sem fragmento                           | Primeira página válida ou estado vazio claro                       |
| Link de aba                                    | Abre sua primeira página e seleciona a aba                         |
| Link de página                                 | Conteúdo e menus correspondem ao endereço                          |
| Link de título                                 | Conteúdo carregado e trecho visível                                |
| Recarregar                                     | Preserva destino                                                   |
| Voltar/Avançar a partir de link direto         | Reconstrói cada destino corretamente                               |
| Copiar link/abrir em nova aba                  | Funciona sem depender da sessão anterior da interface              |
| Aba/página desconhecida                        | Erro legível e recuperação                                         |
| Título desconhecido                            | Página permanece legível e trecho ausente é informado              |
| Arquivo ausente, vazio ou falha de rede        | Mensagem adequada, sem exibir conteúdo antigo como se fosse o novo |
| Títulos repetidos, acentuados e IDs explícitos | IDs válidos, únicos e estáveis conforme o contrato                 |
| Clique rápido entre páginas                    | Última escolha vence                                               |
| Configuração vazia ou inválida                 | Estado controlado, sem exceção não tratada                         |
| Site servido em subpasta                       | Links, HTML, CSS e imagens continuam funcionando                   |
| Celular e teclado                              | Navegação e leitura acessíveis                                     |
| Duas instalações após atualizar tema           | Conteúdo preservado e estilo compatível                            |
| Ambiente corporativo sem autorização           | Conteúdo e anexos não são entregues                                |

## Divisão prática do trabalho

Você mantém o tema e aprende os conceitos em cada entrega. Seu amigo cria conteúdo de teste, segue o guia sem ajuda e registra problemas com passos para reproduzir. A equipe responsável pelo ambiente da empresa valida identidade, acesso e hospedagem.

Um relato útil de bug contém: versão/revisão, navegador, URL fictícia, passos, resultado esperado e resultado obtido. Exemplos e imagens levados ao repositório público devem estar livres de informações internas.

## Fora do primeiro MVP

Editor visual, colaboração simultânea, comentários, pesquisa avançada, banco de dados, anexos enviados pela interface e permissões por documento são evoluções separadas. Busca simples pode ser a próxima melhoria depois que leitura, links e atualizações estiverem estáveis.

Não precisamos prever hoje cada extensão possível. Primeiro entregar uma base confiável; depois usar a experiência real para escolher a próxima necessidade.

## Próxima tarefa recomendada

Concluir os exemplos da Etapa 2: resolver as páginas ausentes/vazias e padronizar os fragmentos HTML. Depois, concluir o contrato de navegação antes de criar o índice e os links de títulos. Algumas correções básicas de navegação já foram necessárias na separação, mas as Etapas 2 e 3 ainda não estão completas.
