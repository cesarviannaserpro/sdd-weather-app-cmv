# Especificação do Produto — Weather App

**Status:** rascunho; decisões de MVP definidas, pendente confirmar os termos do provedor e validar as personas.  
**Fontes:** [discovery](discovery.md), [personas](personas.md) e [matriz de riscos](risks.md).

## Overview

O Weather App é uma aplicação web de consulta rápida que permite buscar uma cidade e visualizar as condições meteorológicas atuais e a previsão para cinco dias. A experiência deve priorizar dispositivos móveis e apresentar interface e mensagens em pt-BR.

O produto usará Open-Meteo sem API key. A previsão considera hoje e os quatro dias seguintes, com as datas delimitadas pelo fuso `America/Sao_Paulo` (Brasília, UTC-03:00). Celsius será a unidade inicial; o usuário poderá alternar para Fahrenheit.

As personas em `personas.md` orientam as histórias abaixo, mas são hipóteses derivadas do discovery, não pesquisa validada.

## Decisões de MVP

- A previsão será diária: hoje e os quatro dias seguintes, delimitados por `America/Sao_Paulo`; previsão horária não faz parte desta versão.
- A busca será enviada ao pressionar Enter ou o botão de busca. O campo será aparado nas extremidades; vazio ou apenas espaços não gera chamada de rede. A busca não fará autocomplete por tecla.
- Sugestões exibirão cidade, estado/região e país quando fornecidos pelo geocoding. Selecionar uma sugestão carrega clima atual e previsão para suas coordenadas.
- Temperatura, pressão e vento serão arredondados para o inteiro mais próximo; empates de 0,5 serão arredondados para longe de zero. Umidade e probabilidade de precipitação serão percentuais inteiros. Vento será exibido em km/h, pressão em hPa e umidade em %. Volumes de precipitação serão exibidos em mm com uma casa decimal. A interface usa vírgula como separador decimal.
- Precipitação atual será o volume informado pelo provedor para a observação atual em mm; a previsão diária mostrará probabilidade em % e volume total em mm.
- Códigos WMO retornados pela fonte serão mapeados para descrições em pt-BR. Código não mapeado será apresentado como “Condição não disponível”.
- A tela inicial solicitará a busca manual de uma cidade. Não haverá geolocalização automática, autenticação, favoritos, histórico, idiomas além de pt-BR, modo offline ou cache persistente.
- Os dados serão carregados ao selecionar a cidade e por atualização manual. Não haverá atualização periódica automática. A tela informará “Consultado às HH:mm” no fuso `America/Sao_Paulo`; isso representa o horário em que a resposta foi recebida, não a hora de observação meteorológica.
- Cada chamada de rede terá deadline de 8.000 ms a partir do envio. Ao atingir o deadline, a requisição será cancelada. Não haverá repetição automática; cada ativação manual de nova tentativa inicia uma única chamada, preservando cidade e operação. Controles ficam desabilitados enquanto a mesma operação está em andamento.
- Ao selecionar outra cidade, dados da cidade anterior deixam de ser exibidos enquanto a nova consulta carrega. Falha em atualização manual da mesma cidade mantém os dados anteriores em memória, identificados como desatualizados.
- A aplicação exibirá atribuição visível à Open-Meteo; os termos e a redação exata da atribuição ainda devem ser confirmados antes da publicação.

## Functional Requirements

- **FR-01 — Busca e seleção de cidade:** enviar geocoding apenas por Enter ou pelo botão de busca; apresentar sugestões com cidade, estado/região e país quando disponíveis. Selecionar uma sugestão define a cidade ativa e solicita clima atual e previsão usando as coordenadas daquela opção.
- **FR-02 — Condições atuais:** exibir temperatura, condição meteorológica, umidade, vento, pressão e precipitação atual para a cidade selecionada, usando unidades e regras de arredondamento definidas nas decisões de MVP.
- **FR-03 — Previsão diária:** exibir cinco datas consecutivas — hoje e quatro dias seguintes em `America/Sao_Paulo` — com mínima, máxima, condição meteorológica, probabilidade e volume total de precipitação e velocidade do vento.
- **FR-04 — Unidade de temperatura:** iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit, atualizando todas as temperaturas sem nova chamada à API.
- **FR-05 — Estados e falhas:** apresentar estados distintos para carregamento, entrada vazia, busca sem resultados, falha de rede/API/timeout e dados parciais. Mensagens de erro não devem indicar que a cidade não existe quando a falha for técnica.
- **FR-06 — Nova tentativa:** permitir uma nova tentativa manual da operação que falhou, preservando cidade e consulta. Não iniciar novas tentativas automaticamente nem permitir chamadas duplicadas enquanto uma operação está pendente.
- **FR-07 — Atualização manual:** permitir atualizar os dados da cidade ativa sob demanda e mostrar o horário da última atualização; em falha, manter os últimos dados válidos em memória e identificá-los como desatualizados.

## User Stories

- **US-01 (FR-01):** Como **Viajante planejador**, quero buscar uma cidade e escolher a sugestão correta, para planejar a semana para a localidade desejada.
- **US-02 (FR-02):** Como **Decisor do dia a dia**, quero visualizar rapidamente as condições meteorológicas atuais, para decidir que roupa usar ou se devo levar guarda-chuva.
- **US-03 (FR-03):** Como **Viajante planejador**, quero comparar a previsão de hoje e dos quatro dias seguintes, para organizar a semana.
- **US-04 (FR-04):** Como **Decisor do dia a dia**, quero alternar a temperatura entre Celsius e Fahrenheit, para interpretá-la na unidade que prefiro.
- **US-05 (FR-05):** Como **Decisor do dia a dia**, quero distinguir carregamento, ausência de resultados e falha, para saber se devo aguardar, ajustar a busca ou tentar novamente.
- **US-06 (FR-06):** Como **Viajante planejador**, quero repetir uma consulta que falhou, para obter a previsão sem reiniciar meu planejamento.
- **US-07 (FR-07):** Como **Decisor do dia a dia**, quero atualizar manualmente o clima da minha cidade, para conferir dados recentes antes de decidir que roupa usar ou se levo guarda-chuva.

As histórias se baseiam nas personas descritas em `personas.md`. Não presumem dados demográficos nem que suas métricas hipotéticas já tenham sido validadas.

## Traceability Matrix

| User Story | Acceptance Criteria | Non-Functional Requirements |
| --- | --- | --- |
| **US-01 — Buscar e selecionar cidade** | AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-01.5, AC-01.6; AC-05.2 e AC-05.3 para resultado vazio ou falha no geocoding. | NFR-01 (performance), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-04 (resiliência), NFR-05 (integração), NFR-07 (pt-BR), NFR-09 (compatibilidade), NFR-10 (privacidade). |
| **US-02 — Consultar condições atuais** | AC-02.1, AC-02.2, AC-02.3; AC-05.3, AC-05.5 e AC-05.6 para falha ou resposta parcial. | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08 (disponibilidade externa), NFR-09. |
| **US-03 — Consultar previsão diária** | AC-03.1, AC-03.2; AC-05.3, AC-05.5 e AC-05.6 para falha ou resposta parcial. | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08, NFR-09, NFR-10 (atualidade). |
| **US-04 — Alternar unidade** | AC-04.1, AC-04.2. | NFR-02, NFR-03, NFR-07. |
| **US-05 — Entender estados** | AC-01.1 para input vazio; AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5 e AC-05.6; AC-06.2 para repetição malsucedida. | NFR-02, NFR-03, NFR-04, NFR-07, NFR-08. |
| **US-06 — Repetir consulta** | AC-05.3 e AC-05.4 para falha/timeout; AC-06.1 e AC-06.2. | NFR-03, NFR-04, NFR-08, NFR-09. |
| **US-07 — Atualizar dados** | AC-07.1, AC-07.2; AC-05.3 e AC-05.4 para falha/timeout na atualização. | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-07, NFR-08, NFR-10. |

## Acceptance Criteria

- **AC-01.1 (FR-01) — Input vazio**
	- **Given:** o campo de cidade contém apenas espaços ou está vazio.
	- **When:** a pessoa envia a busca.
	- **Then:** nenhuma chamada de geocoding é feita e a interface solicita o nome de uma cidade.
- **AC-01.6 (FR-01) — Envio da busca**
	- **Given:** o campo contém `  São Paulo  ` com espaços externos.
	- **When:** a pessoa envia pelo botão de busca ou pela tecla Enter.
	- **Then:** cada modo envia exatamente uma chamada de geocoding com a consulta `São Paulo`.
- **AC-01.2 (FR-01) — Sugestões e desambiguação**
	- **Given:** a busca enviada retorna duas localidades de mesmo nome com estado/região e país distintos.
	- **When:** os resultados são apresentados.
	- **Then:** cada localidade aparece como opção selecionável com nome, estado/região e país, sem combinar dados entre opções.
- **AC-01.3 (FR-01) — Seleção**
	- **Given:** a busca retornou uma sugestão com coordenadas identificadas.
	- **When:** a pessoa seleciona essa sugestão.
	- **Then:** a localidade selecionada passa a ser a ativa e a consulta meteorológica usa suas coordenadas para carregar clima atual e previsão.
- **AC-01.4 (FR-01) — Caracteres especiais**
	- **Given:** a pessoa envia uma cidade com acentos ou caracteres como `São Tomé & Príncipe`.
	- **When:** a busca é enviada.
	- **Then:** o texto é codificado corretamente na requisição e exibido como texto inerte na interface, sem execução de marcação ou script.
- **AC-01.5 (FR-01) — Troca de cidade**
	- **Given:** há dados carregados para a cidade A e a pessoa seleciona a cidade B.
	- **When:** a consulta para B está pendente.
	- **Then:** os dados de A deixam de ser apresentados como atuais e a interface identifica B como cidade em carregamento.
- **AC-02.1 (FR-02) — Dados atuais**
	- **Given:** a cidade selecionada tem uma resposta simulada com temperatura `20.4 °C`, condição WMO, umidade `63%`, vento `12 km/h`, pressão `1013.4 hPa` e precipitação `0.6 mm`.
	- **When:** as condições atuais são carregadas.
	- **Then:** a tela associa os dados à cidade, exibe `20 °C`, `63%`, `12 km/h`, `1013 hPa` e `0,6 mm`, e identifica as unidades de todos os valores.
- **AC-02.2 (FR-02) — Tradução de condição**
	- **Given:** a resposta simulada contém o código WMO `0`.
	- **When:** a condição atual é exibida.
	- **Then:** a interface apresenta “Céu limpo” em pt-BR.
- **AC-02.3 (FR-02) — Código desconhecido**
	- **Given:** a resposta simulada contém um código WMO sem mapeamento.
	- **When:** a condição é exibida.
	- **Then:** a interface apresenta “Condição não disponível” sem falhar a renderização da seção.
- **AC-03.1 (FR-03) — Limites de data**
	- **Given:** o relógio do teste está fixado em `2026-10-01T02:30:00Z` (30 de setembro, 23:30 em `America/Sao_Paulo`) e a resposta simulada contém cinco dias.
	- **When:** a previsão diária é carregada.
	- **Then:** são exibidas, nessa ordem, as datas 30 de setembro e 1, 2, 3 e 4 de outubro de 2026, sem dados horários.
- **AC-03.2 (FR-03) — Dados diários**
	- **Given:** a resposta simulada contém mínima, máxima, condição, probabilidade de precipitação, volume total de precipitação e vento para cada dia.
	- **When:** a previsão é apresentada.
	- **Then:** cada data exibe esses dados, usando °C, %, mm e km/h, com temperaturas, velocidades, pressão e percentuais arredondados para o inteiro mais próximo e volume de precipitação com uma casa decimal e vírgula decimal.
- **AC-04.1 (FR-04) — Padrão**
	- **Given:** uma sessão nova sem preferência de unidade previamente selecionada.
	- **When:** os dados meteorológicos são apresentados.
	- **Then:** todas as temperaturas são exibidas em °C.
- **AC-04.2 (FR-04) — Alternância**
	- **Given:** os dados atuais e a previsão incluem `20 °C` e `-5 °C`.
	- **When:** a pessoa seleciona Fahrenheit.
	- **Then:** todas as temperaturas exibem `68 °F` e `23 °F`, respectivamente, nenhuma temperatura permanece em °C, as unidades sem conversão permanecem inalteradas e nenhuma nova chamada à API é feita.
- **AC-05.1 (FR-05) — Carregamento**
	- **Given:** uma busca foi enviada e a resposta simulada permanece pendente.
	- **When:** a interface aguarda a resposta.
	- **Then:** um indicador de carregamento fica visível e é removido quando a operação termina ou falha.
- **AC-05.2 (FR-05) — Busca sem resultados**
	- **Given:** o geocoding retorna sucesso com uma lista vazia.
	- **When:** a resposta é processada.
	- **Then:** “Nenhuma cidade encontrada. Confira a grafia ou tente outro nome.” é apresentada, sem botão de retry técnico, erro técnico ou chamada de previsão.
- **AC-05.3 (FR-05) — Falha técnica**
	- **Given:** o geocoding ou a consulta meteorológica retorna erro HTTP, falha de rede ou resposta ilegível.
	- **When:** a operação termina.
	- **Then:** o carregamento é encerrado, “Não foi possível carregar os dados. Tente novamente.” é apresentada em pt-BR, a cidade/consulta é preservada e há ação para tentar novamente; o estado não é apresentado como “cidade não encontrada”.
- **AC-05.4 (FR-05) — Timeout**
	- **Given:** uma chamada permanece pendente após ser enviada.
	- **When:** o relógio de teste avança 8.000 ms sem resposta.
	- **Then:** a chamada é cancelada, o carregamento termina e a interface apresenta erro de demora com ação para tentar novamente, sem iniciar repetição automática.
- **AC-05.5 (FR-05) — Resposta parcial**
	- **Given:** uma resposta válida contém alguns campos opcionais e omite outros.
	- **When:** os dados são apresentados.
	- **Then:** valores válidos são exibidos, cada campo ausente é identificado como “Indisponível” e nenhum valor ausente é mostrado como zero ou estimado.
- **AC-05.6 (FR-05) — Dados essenciais ausentes**
	- **Given:** a resposta não contém a temperatura atual ou, para um dia, não contém mínima ou máxima.
	- **When:** a seção afetada é renderizada.
	- **Then:** essa seção ou dia informa indisponibilidade, enquanto outras seções com dados válidos permanecem visíveis.
- **AC-06.1 (FR-06) — Repetição**
	- **Given:** uma consulta falhou e a interface apresenta nova tentativa.
	- **When:** a pessoa aciona a ação uma vez.
	- **Then:** a mesma operação é enviada uma vez usando a cidade e os parâmetros preservados, e o estado de carregamento é apresentado.
- **AC-06.2 (FR-06) — Repetição malsucedida**
	- **Given:** a nova tentativa também falha.
	- **When:** a falha é processada.
	- **Then:** a mensagem de erro e a ação de nova tentativa permanecem visíveis; uma única ativação gera no máximo uma chamada e nenhuma chamada automática adicional.
- **AC-07.1 (FR-07) — Atualização manual**
	- **Given:** há uma cidade ativa e dados carregados com horário de atualização conhecido.
	- **When:** a pessoa aciona “Atualizar”.
	- **Then:** os dados são requisitados novamente e “Consultado às HH:mm” passa a mostrar o horário de recebimento da resposta em `America/Sao_Paulo`.
- **AC-07.2 (FR-07) — Falha ao atualizar**
	- **Given:** há dados válidos em memória e a atualização falha.
	- **When:** a falha é processada.
	- **Then:** os dados anteriores continuam visíveis com a mensagem “Não foi possível atualizar. Exibindo dados consultados às HH:mm.” e a ação para tentar novamente; o horário da consulta anterior não é substituído.

## Non-Functional Requirements

- **NFR-01 — Performance:** em Lighthouse CI com perfil mobile, 4× CPU slowdown e rede configurada para 1,6 Mbps/150 ms RTT, o LCP do shell inicial deve ser inferior a 2 s no percentil 75 de 8 execuções. O tempo de resposta da API é excluído e medido separadamente.
- **NFR-02 — Responsividade:** em larguras de 320, 375, 768, 1024 e 1920 px, conteúdo e controles não devem ser cortados nem causar rolagem horizontal da página.
- **NFR-03 — Acessibilidade:** atender ao WCAG 2.2 nível AA em todos os estados da tela; todos os fluxos devem ser operáveis por teclado, ter foco visível, nomes acessíveis e contraste conforme o padrão. Mudanças de estado devem ser anunciadas sem mover foco inesperadamente.
- **NFR-04 — Resiliência:** cada chamada de rede termina em sucesso ou erro em até 8.000 ms; loading é encerrado em ambos os casos. Nova tentativa é manual e uma ativação não pode gerar chamadas duplicadas.
- **NFR-05 — Integração:** consumir Open-Meteo sem API key, validar a estrutura das respostas antes de renderizá-las e exibir atribuição visível. Publicação depende da confirmação dos termos, limites e texto exigido pelo provedor.
- **NFR-06 — Manutenibilidade:** chamadas de rede, validação e transformação dos dados ficam fora dos componentes de interface.
- **NFR-07 — Idioma e formato:** textos e mensagens em pt-BR; datas em `dd/MM/yyyy`, horas em `HH:mm`, vírgula como separador decimal e ponto como separador de milhar. Não oferecer outros idiomas nesta versão.
- **NFR-08 — Disponibilidade externa:** não há SLA para a API Open-Meteo. Durante indisponibilidade, a interface carregada continua permitindo editar a busca e apresenta o estado de erro definido em FR-05/FR-06.
- **NFR-09 — Compatibilidade:** suportar a versão estável atual e a versão principal anterior de Chrome, Firefox, Edge e Safari desktop; Chrome para Android e Safari para iOS nas duas versões principais atuais do sistema operacional.
- **NFR-10 — Privacidade e atualidade:** não persistir consultas ou preferências em servidor, localStorage ou cache persistente. Dados permanecem somente na memória da página; a interface mostra “Consultado às HH:mm” no fuso `America/Sao_Paulo`.

## Edge Cases

- **Input vazio ou só com espaços:** não enviar requisição; manter a pessoa no formulário e solicitar uma cidade.
- **Cidade inexistente/geocoding vazio:** mostrar a mensagem exata definida em AC-05.2, manter a consulta editável e não chamar a previsão. Um retorno vazio bem-sucedido não é erro técnico.
- **Caracteres especiais:** preservar Unicode e acentos na consulta, codificá-los na requisição e renderizar o resultado como texto inerte.
- **Cidades homônimas:** apresentar cada resultado separadamente com cidade, estado/região e país retornados pelo provedor; a seleção usa as coordenadas daquela opção.
- **Falha HTTP, rede ou resposta ilegível:** encerrar carregamento, preservar cidade e consulta, mostrar a mensagem definida em AC-05.3, distinta de “nenhuma cidade encontrada”, e oferecer repetição manual da operação que falhou.
- **Timeout:** cancelar a chamada após 8 segundos, encerrar carregamento e apresentar erro de demora e ação manual para tentar novamente; não repetir automaticamente.
- **Resposta parcial:** mostrar campos válidos e identificar campos opcionais ausentes como “Indisponível”; se temperatura atual ou mínima/máxima diária essenciais faltarem, marcar somente a seção/dia afetado como indisponível e manter outras seções válidas.
- **Falha ao atualizar dados já exibidos:** manter em memória os últimos dados válidos, marcá-los como desatualizados, preservar o horário da última atualização bem-sucedida e oferecer nova tentativa.
- **Fuso diferente no dispositivo ou na cidade:** manter datas da previsão calculadas em `America/Sao_Paulo`.
- **Alternância de unidade:** recalcular todas as temperaturas visíveis sem solicitar novamente os dados meteorológicos.

## Assumptions

- O uso é individual, sem autenticação e sem persistência em servidor.
- A pessoa usuária terá acesso à internet na maior parte do tempo.
- A cidade é escolhida manualmente; geolocalização automática está fora do escopo desta versão.
- Nenhuma consulta ou preferência será persistida entre sessões; perder os dados ao recarregar a página é aceitável no MVP.
- O provedor fornece códigos WMO e os campos usados pelos requisitos; ausência de valores será tratada conforme os critérios de aceite.
- As personas e métricas de sucesso são hipóteses e ainda precisam de validação com usuários.
- A atribuição visível à Open-Meteo será incluída; termos e limites de uso serão confirmados antes de publicar.

## Risks

Os riscos identificados, com probabilidades, impactos e estratégias de mitigação, estão detalhados na [matriz de riscos](risks.md). Os riscos prioritários são indisponibilidade ou resposta incompleta do provedor, seleção de cidade ambígua, falha de rede, inconsistência de unidades e não conformidade com os termos de uso da fonte.

## Out of Scope

- **Contas e dados:** autenticação, perfis, sincronização e persistência em servidor; salvar consultas ou preferências no dispositivo; favoritos e histórico.
- **Localidades:** geolocalização ou seleção automática; manter ou comparar mais de uma cidade por vez. O MVP consulta uma cidade ativa por vez.
- **Previsões e dados adicionais:** previsão horária, histórico meteorológico, mapas, radar, alertas (incluindo avisos de tempo severo), qualidade do ar, índice UV e pólen.
- **Operação:** funcionamento offline, cache persistente e atualização periódica automática. A atualização ocorre somente por ação explícita da pessoa usuária.
- **Canais e distribuição:** aplicativos nativos para iOS/Android, notificações push, widgets, compartilhamento ou exportação da previsão.
- **Localização da interface:** idiomas além de pt-BR.

## Open Questions

1. Confirmar os termos de uso, limites de requisição e texto exato de atribuição da Open-Meteo antes da publicação.
2. Validar com usuários as personas e as metas de tempo de sucesso antes de tratá-las como compromissos de produto.