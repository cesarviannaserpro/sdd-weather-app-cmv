## Contexto

Aplicação web de previsão do tempo para uso pessoal rápido. O usuário poderá
buscar uma cidade e visualizar o clima atual e a previsão dos próximos 5 dias,
com opção de alternar entre Celsius e Fahrenheit. A experiência deve priorizar
dispositivos móveis.

## Resumo Executivo

O Weather App permitirá buscar cidades e consultar o clima atual e a previsão, priorizando o uso em dispositivos móveis.  
As personas são o Viajante planejador e o Decisor do dia a dia; ambas são hipóteses ainda a validar.  
As decisões atuais definem Open-Meteo, previsão de hoje mais quatro dias no fuso de Brasília, Celsius como padrão, interface em pt-BR e ausência de autenticação ou persistência no servidor.  
O produto prevê alternância entre Celsius e Fahrenheit, além de estados de carregamento, erro e nova tentativa.  
Antes de fechar a especificação, ainda é preciso decidir granularidade da previsão, unidades dos demais dados, busca, atualização e escopo de recursos como favoritos e uso offline.

## Personas

Consulte as [personas do Weather App](personas.md) como hipóteses para orientar histórias de usuário e critérios de aceite.

## Decisões

| Decisão | Justificativa | O que resolve das perguntas em aberto |
| --- | --- | --- |
| Usar Open-Meteo como fonte de dados, sem API key. | Atende à necessidade de uma fonte pública sem exigir credenciais para a primeira versão. | Resolve a escolha da fonte na pergunta 12; ainda é necessário confirmar atribuição, cobertura e tratamento de campos indisponíveis. |
| Definir a previsão como hoje mais os quatro dias seguintes, usando o fuso `America/Sao_Paulo` (Brasília, UTC-03:00) para datas e limites dos dias. | Torna explícitos o período e o calendário usados na previsão, independentemente do fuso do dispositivo ou da cidade consultada. | Resolve a inclusão do dia atual e o fuso das datas nas perguntas 1 e 14; a granularidade diária ou horária continua em aberto. |
| Exibir Celsius por padrão. | Estabelece um padrão inicial coerente com o público e a interface em pt-BR. | Resolve a unidade padrão de temperatura na pergunta 3; unidades de vento, pressão e precipitação e regras de arredondamento continuam em aberto. |
| Não exigir autenticação nem manter persistência em servidor. | Mantém a primeira versão como experiência individual, sem contas ou armazenamento remoto de dados do usuário. | Consolida as suposições de uso individual e ausência de persistência em servidor; não decide armazenamento local, favoritos ou histórico (perguntas 4, 6, 7 e 22). |
| Apresentar a interface em pt-BR. | Define o idioma inicial da experiência e mantém consistência com o requisito RNF7. | Confirma o idioma da interface na pergunta 5; suporte futuro a outros idiomas e regras de formatação regional permanecem em aberto. |

## Requisitos Funcionais

- **RF1** — Buscar cidade por nome, exibindo sugestões para desambiguação.
- **RF2** — Exibir clima atual: temperatura, condição, umidade, vento, pressão e precipitação.
- **RF3** — Exibir previsão de 5 dias com mínima, máxima, condição, precipitação e vento.
- **RF4** — Alternar entre Celsius e Fahrenheit, atualizando todos os valores.
- **RF5** — Exibir estados de carregamento, erro e vazio.
- **RF6** — Permitir tentar novamente quando ocorrer uma falha de rede ou API.

## Requisitos Não-Funcionais

- **RNF1 — Performance:** carga inicial inferior a 2 segundos em uma conexão típica.
- **RNF2 — Responsividade:** interface mobile-first, funcional de 320px até desktop.
- **RNF3 — Acessibilidade:** navegação por teclado, labels semânticos e contraste adequado.
- **RNF4 — Resiliência:** tratar falhas de rede e indisponibilidade da API de forma clara.
- **RNF5 — Integração:** utilizar uma fonte pública de dados sem necessidade de API key.
- **RNF6 — Manutenibilidade:** manter o acesso a dados isolado dos componentes de UI.
- **RNF7 — Internacionalização:** interface e mensagens apresentadas em pt-BR.

## Riscos

Consulte a [matriz de riscos do Weather App](risks.md) para probabilidade, impacto e estratégias de mitigação.

## Perguntas em Aberto (Open Questions)

1. A previsão será apresentada apenas como resumo diário ou também terá dados por hora? **Impacto:** determina a granularidade dos dados, o layout da previsão e os critérios de aceite.
2. A aplicação oferecerá geolocalização automática, além da busca manual? Se sim, ela será opcional e qual alternativa será oferecida quando a permissão for negada? **Impacto:** altera o fluxo inicial, as permissões solicitadas, as considerações de privacidade e os testes.
3. Quais unidades serão usadas para vento, pressão e precipitação, e como os valores serão arredondados? **Impacto:** afeta a compreensão dos dados, a consistência da interface, as conversões e os testes.
4. O aplicativo deve funcionar offline? Deve exibir a última consulta em cache, permitir novas consultas offline ou apenas manter dados entre sessões? **Impacto:** define as expectativas de uso sem rede, a estratégia de armazenamento local e os cenários de teste.
5. Há necessidade de suportar outros idiomas além de pt-BR? Como datas, horários e números devem ser formatados na interface em pt-BR? **Impacto:** afeta textos, formatos regionais, nomes das condições e cobertura de testes.
6. Será necessário salvar cidades favoritas? Onde serão armazenadas e como o usuário poderá removê-las? **Impacto:** adiciona fluxos e interface de gerenciamento, além de decisões sobre persistência e privacidade.
7. Haverá histórico de consultas? Se houver, quantas consultas serão mantidas, por quanto tempo e como poderão ser apagadas? **Impacto:** muda a experiência entre visitas e exige regras de retenção, controles para o usuário e testes adicionais.
8. O que o usuário verá antes de fazer a primeira busca: estado vazio, cidade padrão ou última cidade consultada? **Impacto:** define a primeira experiência e se o app precisa carregar ou persistir uma localização sem ação explícita.
9. Quais informações identificarão cada sugestão de cidade, como país, estado ou região? Como o usuário escolhe entre homônimos? **Impacto:** uma seleção ambígua pode exibir dados da localidade errada e comprometer a confiança no resultado.
10. Como a busca deve responder a consultas sem resultados ou incompletas, incluindo variações de acentuação e nomes alternativos? **Impacto:** sem orientação, o usuário pode não conseguir encontrar uma cidade; também ficam indefinidos estados e critérios de teste.
11. A busca deve apresentar sugestões enquanto o usuário digita ou somente após confirmação? Existe um mínimo de caracteres antes de consultar? **Impacto:** afeta o ritmo percebido da busca, o número de chamadas à API e os estados de carregamento das sugestões.
12. Que atribuição o Open-Meteo exige e como proceder se um campo solicitado não estiver disponível para uma localidade? **Impacto:** diferenças de cobertura, termos de uso ou dados ausentes podem exigir alternativas de apresentação.
13. Como serão definidos e traduzidos os termos de condição meteorológica, e precipitação significa volume acumulado, probabilidade de chuva ou ambos? **Impacto:** evita rótulos inconsistentes e interpretações incorretas; determina o mapeamento entre dados e conteúdo exibido.
14. Com que frequência os dados devem ser atualizados? Haverá atualização manual, automática ou ambas, e quando os dados em cache deixam de ser considerados atuais? **Impacto:** afeta a confiança na previsão, o consumo da API e a forma de comunicar a idade dos dados.
15. Quais tipos de falha precisam de mensagens ou ações distintas, por exemplo, cidade não encontrada, falta de conexão, timeout ou indisponibilidade do provedor? **Impacto:** determina se a orientação e a ação de tentar novamente são úteis para cada situação, além da cobertura de testes.
16. Previsão horária, alertas meteorológicos, mapas e notificações fazem parte do produto ou estão fora do escopo inicial? **Impacto:** evita expectativas conflitantes e crescimento não planejado do escopo.
17. Qual critério de acessibilidade deve ser atendido, incluindo teclado, foco visível, leitores de tela e contraste? **Impacto:** sem um critério verificável, a acessibilidade pode variar entre telas e ser difícil de validar.
18. Como medir o limite de carga inicial de 2 segundos: qual métrica, dispositivo e condição de rede serão usados, e o tempo da API externa está incluído? **Impacto:** diferentes condições de teste podem produzir conclusões incompatíveis sobre o atendimento do requisito.
19. O que significa “funcional de 320px até desktop” em termos de conteúdo visível, controles e rolagem? Quais larguras devem ser cobertas na validação? **Impacto:** sem resultados esperados, a responsividade fica subjetiva e telas pequenas podem perder conteúdo ou ações.
20. Qual disponibilidade é esperada para a aplicação e como comunicar indisponibilidades da fonte meteorológica? **Impacto:** separa compromissos controláveis pelo app dos que dependem do provedor e orienta mensagens e critérios operacionais.
21. Quais navegadores e versões, incluindo navegadores móveis, devem ser suportados? **Impacto:** define a matriz de compatibilidade e evita que “navegadores modernos” seja interpretado de formas diferentes.
22. Quais dados de busca serão armazenados localmente e por quanto tempo? O usuário poderá limpar esses dados? **Impacto:** define expectativas de privacidade e retenção, especialmente se histórico, favoritos ou geolocalização forem incluídos.

## Suposições (Assumptions)

- O usuário terá conexão com a internet na maior parte do tempo.
- A aplicação será de uso individual e não exigirá autenticação.
- Serão utilizados navegadores modernos.
- A fonte de dados pública estará disponível sem necessidade de chave de API.
- A primeira versão não terá persistência em servidor.
- O usuário selecionará manualmente a cidade, sem geolocalização automática.
