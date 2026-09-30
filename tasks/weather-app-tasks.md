# Tarefas — Weather App

Backlog derivado do [plano técnico](../plans/weather-app-plan.md) e rastreado à [especificação](../specs/weather-app-spec.md). A ordem do documento é a ordem de implementação; cada tarefa é uma unidade testável. Consulte também a [matriz de rastreabilidade](traceability.md) e a [classificação de prioridades, tamanhos e fatias verticais](priorities-and-slices.md).

## Entrega 1 — Tipos

### T-01 — Definir contratos de domínio
- **Descrição:** criar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `SearchState`, `WeatherState` e `WeatherError`.
- **Requisitos:** FR-01 a FR-07; NFR-06.
- **Tipo:** Data
- **Critérios de aceite:** tipos seguem o Data Model; opcionais numéricos aceitam `number | null`; temperaturas do domínio são Celsius; estados têm os discriminantes definidos no plano.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Prompt de implementação:** [T-01 — Prompt para o Coding Agent](t-01-implementation-prompt.md).

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura
- **Descrição:** criar conversão Celsius/Fahrenheit e arredondamento de apresentação.
- **Requisitos:** FR-04; AC-04.2; NFR-07.
- **Tipo:** Data
- **Critérios de aceite:** `20 °C` retorna `68 °F`; `-5 °C` retorna `23 °F`; entradas `null` retornam `null`; arredondamentos de `20,5` e `-4,5` seguem a regra registrada no teste; funções não mutam entradas.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.

### T-03 — Implementar formatação de datas e valores
- **Descrição:** criar formatação pt-BR, horário de Brasília e datas-calendário.
- **Requisitos:** FR-02, FR-03; AC-02.3, AC-03.1; NFR-07, NFR-10.
- **Tipo:** Data
- **Critérios de aceite:** `2026-10-01T02:30:00Z` formata como `30/09/2026 23:30`; `2026-10-01` permanece no dia 1; `null` retorna “Indisponível”; horas usam `HH:mm` e decimais usam vírgula.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`.

### T-04 — Implementar descrições WMO
- **Descrição:** mapear códigos WMO para descrições pt-BR.
- **Requisitos:** FR-02, FR-03; AC-02.2, AC-02.3.
- **Tipo:** Data
- **Critérios de aceite:** código `0` retorna “Céu limpo”; código desconhecido retorna “Condição não disponível”; nenhuma chamada lança exceção.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.

## Entrega 3 — Services

### T-05 — Preparar entrypoint e estilos globais
- **Descrição:** configurar o elemento raiz, `App` mínimo e CSS/Tailwind global.
- **Requisitos:** NFR-02, NFR-06.
- **Tipo:** Infra
- **Critérios de aceite:** `pnpm dev` inicia e o elemento raiz contém `App`; `pnpm build` termina com código 0; em 320 px `scrollWidth <= innerWidth`; não há chamada meteorológica.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `tailwind.config.js`.

### T-06 — Implementar requisição com deadline
- **Descrição:** centralizar `fetch`, `AbortController`, timeout e erros tipados.
- **Requisitos:** FR-06; AC-05.3, AC-05.4; NFR-04.
- **Tipo:** Data
- **Critérios de aceite:** HTTP 503 produz `{ kind: "http", status: 503 }`; rejeição produz `{ kind: "network" }`; após 8.000 ms produz `{ kind: "timeout" }`; abort externo não produz timeout.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/weatherService.ts`.

### T-07 — Implementar busca de cidades
- **Descrição:** consultar Geocoding e mapear resultados para `City`.
- **Requisitos:** FR-01, FR-05; AC-01.2, AC-01.4, AC-05.2; NFR-04, NFR-05.
- **Tipo:** Data
- **Critérios de aceite:** URL contém `count=10`, `language=pt` e `format=json`; consulta é aparada e percent-encoded; resultado preserva id, nome, região, país e coordenadas; `results: []` retorna `[]`, payload inválido retorna `invalid-response`.
- **Dependências:** T-01, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`.

### T-08 — Implementar normalização do Forecast
- **Descrição:** consultar Forecast e mapear clima atual e cinco dias.
- **Requisitos:** FR-02, FR-03; AC-02.1, AC-03.1, AC-03.2; NFR-04, NFR-05, NFR-10.
- **Tipo:** Data
- **Critérios de aceite:** URL contém timezone, cinco dias e unidades do plano; seis campos atuais e sete diários são mapeados; retorno tem cinco datas `YYYY-MM-DD`; `fetchedAt` é ISO criado após a resposta.
- **Dependências:** T-01, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`.

### T-09 — Validar respostas parciais do Forecast
- **Descrição:** validar estrutura, comprimentos dos arrays e números opcionais.
- **Requisitos:** FR-02, FR-03, FR-05; AC-03.2, AC-05.5, AC-05.6.
- **Tipo:** Data
- **Critérios de aceite:** ausentes, strings e `NaN` viram `null`; arrays desalinhados e payload sem `current`/`daily` viram `invalid-response`; nenhum ausente vira zero.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`.

## Entrega 4 — Hook

### T-10 — Implementar busca e seleção no hook
- **Descrição:** implementar busca, estados, seleção e cancelamento de respostas obsoletas em `useWeather`.
- **Requisitos:** FR-01, FR-05; AC-01.1, AC-01.3, AC-01.5, AC-05.1, AC-05.2; NFR-04, NFR-10.
- **Tipo:** Data
- **Critérios de aceite:** input vazio mantém `idle` sem chamar service; busca produz `loading`, `success`, `empty` ou `error`; selecionar B remove o snapshot de A; resposta tardia de A não altera B.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

### T-11 — Implementar clima, retry, refresh e unidade no hook
- **Descrição:** completar consulta meteorológica, retry, refresh stale e unidade de apresentação.
- **Requisitos:** FR-02, FR-04, FR-06, FR-07; AC-04.1, AC-04.2, AC-06.1, AC-06.2, AC-07.1, AC-07.2.
- **Tipo:** Data
- **Critérios de aceite:** retry gera uma chamada preservando cidade/consulta; refresh falho preserva snapshot e `fetchedAt` e define `stale: true`; unidade não chama service; segunda ativação durante loading não gera nova chamada.
- **Dependências:** T-02, T-08, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.

## Entrega 5 — Componentes

### T-12 — Implementar barra de busca
- **Descrição:** criar `SearchBar` com input, envio, sugestões e seleção.
- **Requisitos:** FR-01; AC-01.1, AC-01.2, AC-01.6; NFR-03, NFR-07.
- **Tipo:** UI
- **Critérios de aceite:** Enter e botão disparam busca; `  São Paulo  ` chega como `São Paulo`; homônimos mostram região/país próprios; Tab, setas e Enter selecionam; controles têm nomes acessíveis.
- **Dependências:** T-10.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.

### T-13 — Implementar estados de loading e vazio
- **Descrição:** criar estados visuais de carregamento e busca sem resultados.
- **Requisitos:** FR-05; AC-05.1, AC-05.2; NFR-03, NFR-07.
- **Tipo:** UI
- **Critérios de aceite:** loading expõe `role=status`; vazio exibe exatamente “Nenhuma cidade encontrada. Confira a grafia ou tente outro nome.”; vazio não exibe retry.
- **Dependências:** T-11.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`.

### T-14 — Implementar estado de erro e retry
- **Descrição:** criar estado visual de falha técnica e ação de retry.
- **Requisitos:** FR-05, FR-06; AC-05.3, AC-05.4, AC-06.1; NFR-03.
- **Tipo:** UI
- **Critérios de aceite:** erro técnico exibe “Não foi possível carregar os dados. Tente novamente.”; timeout exibe mensagem de demora; há um botão de retry acessível; não aparece “Nenhuma cidade encontrada”.
- **Dependências:** T-11.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.

### T-15 — Implementar clima atual
- **Descrição:** criar `CurrentWeather` com métricas, condição, indisponibilidade e horário.
- **Requisitos:** FR-02, FR-05; AC-02.1 a AC-02.3, AC-05.5, AC-05.6; NFR-07, NFR-10.
- **Tipo:** UI
- **Critérios de aceite:** fixture de AC-02.1 renderiza `20 °C`, `63%`, `12 km/h`, `1013 hPa` e `0,6 mm`; WMO `0` renderiza “Céu limpo”; `null` renderiza “Indisponível”; horário usa “Consultado às HH:mm”.
- **Dependências:** T-03, T-04, T-11.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.

### T-16 — Implementar cartão de previsão
- **Descrição:** criar `ForecastCard` para um dia completo ou parcial.
- **Requisitos:** FR-03, FR-05; AC-03.1, AC-03.2, AC-05.5, AC-05.6.
- **Tipo:** UI
- **Critérios de aceite:** renderiza data, mínima, máxima, condição, probabilidade, volume e vento; `null` renderiza “Indisponível”; `2026-10-01` permanece em 1 de outubro.
- **Dependências:** T-03, T-04, T-11.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`.

### T-17 — Implementar lista de previsão
- **Descrição:** criar `ForecastList` para os cinco cartões.
- **Requisitos:** FR-03; AC-03.1, AC-03.2; NFR-02, NFR-07.
- **Tipo:** UI
- **Critérios de aceite:** cinco datas produzem exatamente cinco itens na mesma ordem; não há previsão horária; cada item tem nome acessível.
- **Dependências:** T-16.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.

### T-18 — Implementar controle de unidade
- **Descrição:** criar `UnitToggle` para Celsius/Fahrenheit.
- **Requisitos:** FR-04; AC-04.1, AC-04.2; NFR-03, NFR-07.
- **Tipo:** UI
- **Critérios de aceite:** estado inicial contém `°C`; `20 °C` vira `68 °F` e `-5 °C` vira `23 °F`; vento, pressão e precipitação não mudam; controle funciona por teclado.
- **Dependências:** T-02, T-11.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.

## Entrega 6 — Integração

### T-19 — Compor a tela principal
- **Descrição:** conectar hook, busca, estados, clima, previsão e unidade em `App`.
- **Requisitos:** FR-01 a FR-07; AC-01.3, AC-01.5, AC-05.1 a AC-05.3, AC-07.1; NFR-03.
- **Tipo:** UI
- **Critérios de aceite:** cada estado do hook renderiza sua região; seleção chama Forecast com coordenadas; Atualizar chama refresh uma vez; após selecionar B dados de A não aparecem.
- **Dependências:** T-05, T-12, T-13, T-14, T-15, T-17, T-18.
- **Arquivos prováveis:** `src/App.tsx`.

### T-20 — Implementar atribuição ao provedor
- **Descrição:** criar atribuição visível e acessível à Open-Meteo.
- **Requisitos:** NFR-05.
- **Tipo:** UI
- **Critérios de aceite:** tela contém nome/link da Open-Meteo com accessible name; não há afirmação sobre termos ou limites não aprovados.
- **Dependências:** T-19.
- **Arquivos prováveis:** `src/components/ProviderAttribution.tsx`.

## Entrega 7 — Testes

### T-21 — Testar unitariamente a conversão de unidade
- **Descrição:** testar conversão Celsius/Fahrenheit e arredondamento com Vitest.
- **Requisitos:** FR-04; AC-04.2.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam `20 -> 68`, `-5 -> 23`, empates, `null` e ausência de mutação; não usam rede, DOM ou relógio.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.

### T-22 — Testar formatação e WMO
- **Descrição:** testar datas, valores e descrições meteorológicas.
- **Requisitos:** FR-02, FR-03; AC-02.2, AC-02.3, AC-03.1.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam meia-noite UTC, `null`, WMO `0`, WMO desconhecido e entradas imutáveis.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`.

### T-23 — Testar service de Geocoding com mock de fetch
- **Descrição:** testar URL, parâmetros, encoding e mapeamento do service com `fetch` mockado.
- **Requisitos:** FR-01, FR-05; AC-01.2, AC-01.4, AC-05.2, AC-05.3.
- **Tipo:** Test
- **Critérios de aceite:** fixtures cobrem cidade válida, vazia, `results: null`, payload inválido, acentos e HTTP 503; cada caso faz no máximo uma chamada mockada.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/weatherService.geocoding.test.ts`, `tests/unit/fixtures/weather.ts`.

### T-24 — Testar service de Forecast com mock de fetch
- **Descrição:** testar parâmetros, normalização, parcialidade, erros e timeout do service com `fetch` mockado.
- **Requisitos:** FR-02, FR-03, FR-06; AC-02.1, AC-03.2, AC-05.3 a AC-05.6; NFR-04.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam cinco dias, arrays desalinhados, números nulos, HTTP 503, rede e abort em 8.000 ms; não há request externo.
- **Dependências:** T-06, T-08, T-09.
- **Arquivos prováveis:** `tests/unit/weatherService.forecast.test.ts`, `tests/unit/fixtures/weather.ts`.

### T-25 — Testar transições do hook
- **Descrição:** testar hook com services stubados.
- **Requisitos:** FR-01 a FR-07; AC-01.5, AC-04.2, AC-06.1, AC-07.2; NFR-04, NFR-10.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam estados, troca de cidade, resposta tardia ignorada, retry único, refresh stale com `fetchedAt` preservado e unidade sem request.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.

### T-26 — Testar barra de busca
- **Descrição:** testar input, envio, homônimos e seleção por teclado.
- **Requisitos:** FR-01; AC-01.1, AC-01.2, AC-01.6; NFR-03.
- **Tipo:** Test
- **Critérios de aceite:** vazio não chama callback; Enter e botão chamam; dois homônimos permanecem separados; Tab/setas/Enter selecionam; consultas usam roles/labels.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.

### T-27 — Testar componentes nos estados loading, erro e vazio
- **Descrição:** testar os componentes de estado para loading, vazio, erro e retry.
- **Requisitos:** FR-05, FR-06; AC-05.1 a AC-05.4, AC-06.1; NFR-03.
- **Tipo:** Test
- **Critérios de aceite:** testes encontram `role=status`, mensagem exata de vazio, mensagem técnica e botão de retry; vazio não chama retry.
- **Dependências:** T-13, T-14.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.

### T-28 — Testar apresentação meteorológica
- **Descrição:** testar clima atual e previsão com fixtures completas e parciais.
- **Requisitos:** FR-02, FR-03, FR-05; AC-02.1 a AC-03.2, AC-05.5, AC-05.6.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam seis métricas atuais, cinco cartões em ordem, WMO, datas, “Indisponível” e labels acessíveis.
- **Dependências:** T-15, T-17.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastList.test.tsx`.

### T-29 — Testar controle de unidade
- **Descrição:** testar alternância Celsius/Fahrenheit no componente.
- **Requisitos:** FR-04; AC-04.1, AC-04.2; NFR-03.
- **Tipo:** Test
- **Critérios de aceite:** teste encontra `°C`, aciona por teclado, encontra `°F`, `68` e `23`, e confirma métricas não térmicas inalteradas.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.

### T-30 — Testar integração da tela
- **Descrição:** testar `App` com hook/service stubado.
- **Requisitos:** FR-01 a FR-07; AC-01.3, AC-01.5, AC-06.1, AC-07.2; NFR-03.
- **Tipo:** Test
- **Critérios de aceite:** testes verificam busca, seleção, retry, refresh stale, snapshot preservado e remoção dos dados de A ao selecionar B usando roles/labels.
- **Dependências:** T-19, T-20, T-25, T-26, T-27, T-28, T-29.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.

### T-31 — Cobrir fluxo principal no Playwright em desktop e mobile
- **Descrição:** testar busca, seleção, previsão, unidade e atualização com endpoints interceptados, incluindo viewport mobile.
- **Requisitos:** FR-01 a FR-04, FR-07; AC-01.3, AC-02.1, AC-03.1, AC-04.2, AC-07.1; NFR-02.
- **Tipo:** Test
- **Critérios de aceite:** nenhuma requisição externa ocorre; em viewports de 1280 px e 320 px o fluxo encontra clima atual e cinco dias, troca `20 °C` por `68 °F` sem nova chamada e atualiza o horário; controles funcionam por teclado e `scrollWidth <= innerWidth`.
- **Dependências:** T-30.
- **Arquivos prováveis:** `tests/e2e/weather-main.spec.ts`.

### T-32 — Cobrir falhas e viewports no Playwright
- **Descrição:** testar vazio, erro, timeout, retry, stale e responsividade.
- **Requisitos:** FR-05, FR-06, FR-07; AC-05.2 a AC-07.2; NFR-02, NFR-04, NFR-08.
- **Tipo:** Test
- **Critérios de aceite:** cenários cobrem vazio sem Forecast, erro, timeout em 8.000 ms, retry único e refresh stale; em 320/375/768/1024/1920 px `scrollWidth <= innerWidth`.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/weather-resilience.spec.ts`, `playwright.config.ts`.

## Entrega 8 — Hardening

### T-33 — Executar gates do projeto
- **Descrição:** executar lint, build e testes automatizados.
- **Requisitos:** NFR-06.
- **Tipo:** Test
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` terminam com código 0 e os resultados são registrados.
- **Dependências:** T-30, T-31, T-32.
- **Arquivos prováveis:** nenhum arquivo novo.

### T-34 — Verificar acessibilidade, performance e compatibilidade
- **Descrição:** executar WCAG, Lighthouse, teclado, leitor de tela e navegadores suportados.
- **Requisitos:** NFR-01, NFR-02, NFR-03, NFR-09.
- **Tipo:** Test
- **Critérios de aceite:** Lighthouse usa CPU 4x, rede 1,6 Mbps/150 ms RTT e oito execuções com LCP p75 < 2 s; WCAG 2.2 AA não tem violações bloqueantes; versões de NFR-09 são testadas.
- **Dependências:** T-33.
- **Arquivos prováveis:** configuração Lighthouse, `playwright.config.ts`, `tests/`.

### T-35 — Confirmar termos e atribuição Open-Meteo
- **Descrição:** revisar termos, limites e texto exigido pelo provedor.
- **Requisitos:** NFR-05.
- **Tipo:** Infra
- **Critérios de aceite:** existe registro da revisão; atribuição aprovada aparece na tela; qualquer divergência reprova a tarefa e exige atualização de `specs/` e `plans/` antes da publicação.
- **Dependências:** T-20, T-34.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.