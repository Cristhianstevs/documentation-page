# Desenvolver com IA e aprender com o projeto

Guia inicial em 2026-09-27. As orientações de produto foram conferidas na documentação oficial do OpenAI. Os exemplos de trabalho são recomendações para este repositório.

## O que significa “vibe coding” aqui

O termo é usado de formas diferentes: às vezes significa programar conversando com a IA; às vezes descreve aceitar código sem entender como funciona. Para este projeto, vamos praticar desenvolvimento assistido por IA com revisão e aprendizado.

Você define a necessidade e continua responsável por entender as decisões, revisar mudanças e validar o resultado. A IA ajuda a investigar, escrever, explicar e testar. Uma resposta convincente não substitui evidência de que o comportamento funciona.

Exemplo: “crie o índice” é amplo. Um pedido verificável é “leia os h2/h3 do conteúdo, preserve IDs explícitos, gere IDs únicos e faça o link abrir diretamente no título, inclusive após F5”.

## Usar Codex no VS Code

1. Abrir a pasta completa deste projeto no VS Code.
2. Na área de extensões, instalar a extensão oficial Codex da OpenAI, seguindo o link de instalação na [documentação oficial da extensão](https://learn.chatgpt.com/docs/codex/ide). Isso evita escolher uma extensão de nome parecido.
3. Abrir o ícone do Codex. Se não aparecer, usar a paleta de comandos e procurar `Codex: Open Codex Sidebar`.
4. Entrar com a conta apropriada pelo fluxo da extensão. Para usar a assinatura do ChatGPT, escolher o acesso com ChatGPT quando oferecido; não é necessário criar uma chave de API para esse fluxo. O acesso e os limites dependem da conta. [Autenticação oficial](https://learn.chatgpt.com/docs/auth).
5. Começar com uma tarefa pequena, mencionando os arquivos relevantes. Pedir ao Codex que resuma as instruções do `AGENTS.md` ajuda a conferir o contexto.
6. Revisar as alterações no controle de versão do VS Code e testar o comportamento antes de registrar o commit.

A CLI é uma alternativa; não é necessário instalá-la apenas para começar com a extensão. No Windows, seguir a configuração nativa recomendada; WSL é uma opção para ferramentas Linux ou necessidades específicas. [Orientação oficial para Windows](https://learn.chatgpt.com/docs/windows/windows-sandbox).

O site deste projeto não usa a API da OpenAI. Usar Codex para ajudar a programá-lo não adiciona IA ao produto nem exige colocar chaves da OpenAI no JavaScript do site.

## O papel de cada arquivo

| Arquivo/local         | Serve para                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| `README.md`           | Apresentar o projeto e apontar por onde começar                        |
| `AGENTS.md`           | Instruir o agente sobre contexto, padrões e verificações deste projeto |
| `docs/PLANO-MVP.md`   | Guardar etapas futuras e critérios de conclusão                        |
| `docs/ARQUITETURA.md` | Explicar decisões e seus motivos                                       |
| `docs/GUIA-DE-USO.md` | Ensinar o que o usuário do tema já consegue fazer                      |
| `CHANGELOG.md`        | Registrar o que foi efetivamente entregue                              |
| `.vscode/`            | Compartilhar preferências do editor sem dados pessoais                 |
| `.codex/config.toml`  | Configuração opcional do Codex específica do projeto                   |

Não é necessário criar uma pasta chamada `ia`. Para este tamanho de projeto, `AGENTS.md` curto e documentação bem organizada são suficientes. Uma skill reutilizável faz sentido quando surgir um procedimento recorrente; não é preciso começar construindo um sistema de agentes.

Codex descobre instruções `AGENTS.md` globais e do projeto, incluindo instruções mais específicas ao longo do caminho até o diretório de trabalho. O arquivo da raiz dá o ponto de partida. Uma pasta arbitrária chamada `ia` não ganha leitura automática só por existir. [AGENTS.md na documentação oficial](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

O `AGENTS.md` criado neste projeto pede linguagem simples, mudanças pequenas, uso da configuração e validação de URLs. Ele orienta o agente; não é uma garantia de segurança, um bloqueio de push nem substitui revisão humana.

## Configurações pessoais e do projeto

As preferências pessoais ficam normalmente em `~/.codex/config.toml` (no Windows, dentro da pasta do usuário). Configurações de projeto podem ficar em `.codex/config.toml`, em projetos confiáveis. CLI e extensão compartilham essas camadas. Pela extensão, é possível abrir o arquivo em Codex Settings → Open config.toml. [Configuração oficial](https://learn.chatgpt.com/docs/config-file/config-basic).

No começo, manter as proteções de acesso ao workspace e aprovar exceções específicas é uma escolha adequada. Não é necessário liberar acesso irrestrito para este site estático. Não colocar tokens ou preferências pessoais no repositório compartilhado. Não criamos nem alteramos configurações globais ou instalamos extensões nesta revisão.

Código executado no seu computador não significa necessariamente que o modelo de IA roda offline. No projeto empresarial, seguir a política da empresa para ferramentas de IA e usar exemplos fictícios nesta cópia pública. `.gitignore` não proíbe a IA de ler um arquivo.

## Um ciclo de trabalho para cada funcionalidade

1. **Descrever o problema:** quem usa e o que precisa conseguir fazer.
2. **Definir o aceite:** como distinguir uma entrega funcionando de uma incompleta.
3. **Ler a base:** localizar onde está o comportamento atual.
4. **Escolher uma mudança pequena:** explicar alternativas e o motivo da escolha.
5. **Implementar:** conferir o diff, que mostra linhas adicionadas/removidas.
6. **Verificar:** testar o caminho feliz e os erros mais relevantes.
7. **Documentar e registrar:** atualizar o guia/changelog e fazer um commit com escopo claro.

Um commit é um ponto de recuperação local. Uma branch separa uma linha de trabalho. Uma pull request é um pedido de revisão de mudanças. No tema público, usar apenas dados fictícios em qualquer um deles. Na cópia corporativa, histórico e backup precisam ficar em locais permitidos pela empresa.

## Pedidos úteis ao Codex

Para entender antes de mudar:

> Leia AGENTS.md e explique o caminho entre clicar na lateral e aparecer o HTML. Mostre os arquivos envolvidos e explique fetch, await e DOM com exemplos deste projeto. Nesta tarefa, faça só a análise.

Para implementar uma etapa:

> Implemente a Etapa 3 do plano em mudanças pequenas. Preserve URLs existentes, faça a URL determinar a seleção e mantenha links que abram em nova aba. Verifique link direto, F5, Voltar/Avançar, rota inválida e respostas fora de ordem. Explique as decisões e atualize o guia e o changelog. Use apenas conteúdo fictício.

Para revisar:

> Revise o diff procurando problemas de comportamento e regressões. Para cada problema, dê um cenário de reprodução e a consequência. Diferencie o que foi testado do que foi inferido pelo código.

Para aprender:

> Explique uma decisão desta entrega. Dê um exemplo pequeno, mostre o que daria errado sem ela e proponha um exercício que eu consiga resolver sozinho.

Evitar pedidos sem limites, como “refaça tudo para ficar profissional”. A melhor mudança pode ser uma função pequena, um teste de navegação ou um contrato mais claro.

## Conceitos para aprender na ordem deste projeto

| Conceito                  | Exemplo concreto                                                                 |
| ------------------------- | -------------------------------------------------------------------------------- |
| HTML semântico            | `h2` representa uma seção; CSS cuida de sua aparência                            |
| Array e objeto            | `docsConfig` é uma lista de assuntos; cada assunto contém páginas                |
| Módulos                   | `import`/`export` compartilham configuração entre arquivos                       |
| DOM                       | Representação da página que o JavaScript consulta e altera                       |
| Web Component             | `app-sidebar` encapsula o comportamento da lateral                               |
| Evento e delegação        | A lateral escuta cliques mesmo quando seus links são recriados                   |
| Assincronismo             | `fetch` termina depois; `await` espera o resultado sem bloquear toda a interface |
| Roteamento                | Traduzir `#guias/instalacao` em aba e página selecionadas                        |
| Estado e fonte da verdade | URL define a seleção; configuração define destinos permitidos                    |
| Identidade estável        | `id` de página permanece igual mesmo quando o título muda                        |
| Responsabilidade          | Tema mostra conteúdo; instalação fornece conteúdo; servidor protege o acesso     |
| Teste de regressão        | Garantir que corrigir o índice não quebra Voltar                                 |

Alguns ajustes às explicações antigas: `data-*` é visível no navegador e não serve para esconder segredos; `connectedCallback` é chamado quando o elemento é conectado e pode executar mais de uma vez; Light DOM não isola estilos; `DOMContentLoaded` indica que o HTML foi analisado, não que todos os recursos da tela terminaram de carregar. `try/catch` captura uma falha, mas não identifica sozinho se foi 404, conexão ou programação.

## Como reconhecer uma entrega bem revisada

Você deve conseguir explicar: o que mudou, por que mudou, onde está a regra, como comprovar que funciona e como recuperar a versão anterior. Não é necessário decorar todas as linhas, mas é necessário entender as partes das quais depende a manutenção.

O próximo exercício recomendado é acompanhar a separação entre configuração do tema e conteúdo da instalação. Depois, explicar com suas próprias palavras por que alterar o mesmo `config.js` em várias cópias dificultava o `pull`.
