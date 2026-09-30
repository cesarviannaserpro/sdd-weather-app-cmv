# Plano Técnico — Weather App

**Fonte de produto:** [especificação](../specs/weather-app-spec.md).  
**Status:** proposta técnica para o MVP especificado.

## Architecture

Aplicação cliente React, sem backend próprio. As dependências seguem uma direção única: `App` compõe a apresentação; `components` emitem ações e exibem estado; `hooks` orquestram fluxo e estado da tela; `services` executam e normalizam chamadas externas. `lib` fornece funções puras reutilizáveis, e `types` define os contratos compartilhados. Nenhuma camada inferior importa UI ou estado React.

```text
App
└── components (renderização e eventos do usuário)
  └── hooks/useWeather (estado e orquestração)
    └── services/weatherService (HTTP, timeout, validação e normalização)
      ├── Open-Meteo Geocoding
      └── Open-Meteo Forecast

components, hooks e services ── usam ──> lib (funções puras)
components, hooks e services ── usam ──> types (contratos de domínio)
```

As fronteiras mantêm responsabilidades testáveis: `components` não conhecem URLs nem o formato bruto da API; `hooks` decidem transições de estado sem implementar HTTP; `services` isolam rede e payloads externos; `lib` não depende de React, DOM ou rede.

Uma cidade fica ativa por vez. Ao selecionar outra cidade, os dados anteriores deixam de ser exibidos como atuais. Atualização manual da mesma cidade preserva o último snapshot em memória e o marca desatualizado se a chamada falhar. Não há backend, persistência local ou cache persistente (FR-01, FR-05, FR-06, FR-07; NFR-04, NFR-06, NFR-10).

## Tech Stack

- **TypeScript strict** para contratos explícitos e validação estática, conforme configuração do projeto.
- **React 19 + Vite 8** para a aplicação cliente e build.
- **Tailwind CSS 3** para estilos responsivos mobile-first, conforme convenções existentes.
- **pnpm** como gerenciador de pacotes.
- **Vitest + Testing Library + user-event** para testes unitários e de componentes; **Playwright** para fluxos E2E.
- **Biome** para lint e formatação.
- **Open-Meteo Geocoding e Forecast APIs** como fonte pública, sem API key.

Não adicionar biblioteca de estado, cliente HTTP ou camada de cache: `fetch`, hooks React e serviços locais atendem ao escopo. Reutilizar as versões já fixadas no `package.json`.

## Project Structure

```text
src/
├── components/
│   ├── SearchBar.tsx          # Campo, envio por Enter/botão e sugestões
│   ├── CurrentWeather.tsx     # Condições atuais e horário da consulta
│   ├── ForecastList.tsx       # Cinco resumos diários
│   ├── ForecastCard.tsx       # Apresentação de um dia
│   ├── UnitToggle.tsx         # Celsius/Fahrenheit
│   └── states/                # Loading, vazio e erro
├── hooks/
│   └── useWeather.ts          # Estado e orquestração do fluxo meteorológico
├── services/
│   └── weatherService.ts      # Open-Meteo, timeout, validação e mapeamento
├── lib/
│   ├── format.ts              # Formato pt-BR, datas e horários
│   ├── temperature.ts         # Conversão e arredondamento
│   └── weatherCodes.ts        # Códigos WMO para descrições pt-BR
├── types/
│   └── weather.ts             # Tipos de domínio, API e erros
└── App.tsx                    # Composição da tela

tests/
├── unit/                      # Funções puras, service, hook e componentes
└── e2e/                       # Fluxos do usuário com rede simulada
```

Manter um componente por arquivo. O service não importa React; componentes não conhecem URLs nem formatos brutos da Open-Meteo. Essa separação permite testar `lib` com testes unitários puros; `services` com `fetch` simulado; `hooks` com o service substituído por stub; `components` com props, eventos e consultas acessíveis do Testing Library; e o fluxo completo com Playwright e rotas de rede simuladas. Assim, falhas podem ser localizadas na regra, orquestração, apresentação ou integração sem depender da API real.

## Data Model

Contrato de domínio proposto; valores ausentes são `null`, nunca substituídos por zero. Datas de previsão são datas-calendário locais de Brasília (`YYYY-MM-DD`), não instantes UTC.

```ts
type Unit = "celsius" | "fahrenheit";

interface City {
  id: number; // Identificador da localidade no geocoding.
  name: string; // Nome da cidade retornado pela Open-Meteo.
  region: string | null; // Estado ou região administrativa, quando disponível.
  country: string | null; // País retornado pelo geocoding, quando disponível.
  latitude: number; // Latitude usada para consultar a previsão.
  longitude: number; // Longitude usada para consultar a previsão.
}

interface CurrentWeather {
  temperatureC: number | null; // current.temperature_2m, convertido para Celsius.
  conditionCode: number | null; // current.weather_code conforme código WMO.
  humidityPercent: number | null; // current.relative_humidity_2m, em porcentagem.
  windSpeedKmh: number | null; // current.wind_speed_10m, em km/h.
  pressureHpa: number | null; // current.pressure_msl, em hPa.
  precipitationMm: number | null; // current.precipitation, em milímetros.
}

interface ForecastDay {
  date: string; // daily.time como data-calendário YYYY-MM-DD em Brasília.
  temperatureMinC: number | null; // daily.temperature_2m_min, em Celsius.
  temperatureMaxC: number | null; // daily.temperature_2m_max, em Celsius.
  conditionCode: number | null; // daily.weather_code conforme código WMO.
  precipitationProbabilityPercent: number | null; // daily.precipitation_probability_max, em %.
  precipitationSumMm: number | null; // daily.precipitation_sum, em milímetros.
  windSpeedMaxKmh: number | null; // daily.wind_speed_10m_max, em km/h.
}

interface WeatherData {
  city: City; // Localidade à qual os dados pertencem.
  current: CurrentWeather; // Condições atuais retornadas pelo endpoint Forecast.
  forecast: ForecastDay[]; // Cinco dias em ordem cronológica.
  fetchedAt: string; // Instante ISO 8601 em UTC em que a resposta foi recebida.
  stale: boolean; // Indica que dados em memória não foram atualizados após uma falha.
}
```

`fetchedAt` registra o recebimento da resposta; não representa o instante de observação. Temperaturas permanecem em Celsius no domínio; conversão para Fahrenheit ocorre apenas na apresentação. `conditionCode` é traduzido por função pura; código desconhecido resulta em “Condição não disponível”.

Tipos externos devem ser separados do domínio e tratar campos numéricos opcionais como `number | null` após validação. Não espalhar o formato JSON do provedor pela UI.

## Data Flow

1. A pessoa informa a cidade; o formulário remove espaços externos. Campo vazio mostra orientação e não chama a rede (AC-01.1).
2. Enter ou botão envia exatamente uma consulta de geocoding. A resposta vira `City[]`; lista vazia produz estado sem resultados (AC-01.6, AC-05.2).
3. Selecionar uma sugestão define a cidade ativa e descarta os dados apresentados para a cidade anterior (AC-01.2, AC-01.3, AC-01.5).
4. O service solicita clima atual e previsão diária pelas coordenadas da cidade, com timezone e unidades fixados no contrato abaixo; converte e valida a resposta antes de retornar `WeatherData`.
5. O hook publica o snapshot e o instante de recebimento. A UI formata valores em pt-BR e exibe cinco datas no fuso de Brasília.
6. Alternar unidade deriva todas as temperaturas da base Celsius sem nova requisição (AC-04.1, AC-04.2).
7. Atualizar refaz a consulta da cidade ativa. Sucesso substitui o snapshot; falha mantém o anterior em memória, define `stale: true` e preserva seu `fetchedAt` (AC-07.1, AC-07.2).

Diagrama Mermaid com os caminhos de sucesso, vazio, erro, retry e resposta parcial: [Fluxo de Dados](weather-app-data-flow.md).

## External APIs

Não há backend intermediário nem credenciais. Fazer chamadas `GET` diretamente do cliente; centralizar URL, parâmetros e interpretação em `weatherService`.

### Geocoding

- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Método:** `GET`; sem API key.

| Parâmetro | Valor | Uso |
| --- | --- | --- |
| `name` | Consulta aparada nas extremidades | Nome enviado pela pessoa usuária. |
| `count` | `10` | Limita a quantidade de sugestões retornadas. |
| `language` | `pt` | Solicita nomes localizados em português quando disponíveis. |
| `format` | `json` | Define formato da resposta. |

Exemplo resumido de resposta:

```json
{
  "results": [
    {
      "id": 3448433,
      "name": "São Paulo",
      "latitude": -23.55,
      "longitude": -46.63,
      "country_code": "BR",
      "country": "Brasil",
      "admin1": "São Paulo"
    }
  ]
}
```

Mapeamento para `City`: `id` → `id`, `name` → `name`, `admin1` → `region`, `country` → `country`, `latitude` → `latitude`, `longitude` → `longitude`. Região e país são opcionais; identificador e coordenadas são necessários para selecionar a localidade e consultar o Forecast. Resposta sem resultados (campo `results` ausente, nulo ou vazio) é normalizada para lista vazia, não para erro técnico (FR-01, AC-05.2).

### Forecast

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Método:** `GET`; sem API key.

| Parâmetro | Valor |
| --- | --- |
| `latitude`, `longitude` | Coordenadas da `City` selecionada. |
| `current` | `temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,precipitation` |
| `daily` | `time,temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max,precipitation_sum,wind_speed_10m_max` |
| `timezone` | `America/Sao_Paulo` |
| `forecast_days` | `5` (hoje e os quatro dias seguintes). |
| `temperature_unit` | `celsius` (unidade canônica do domínio). |
| `wind_speed_unit` | `kmh` (km/h). |
| `precipitation_unit` | `mm` (milímetros). |

Exemplo resumido de resposta:

```json
{
  "latitude": -23.55,
  "longitude": -46.63,
  "timezone": "America/Sao_Paulo",
  "current": {
    "time": "2026-09-30T12:00",
    "temperature_2m": 20.4,
    "relative_humidity_2m": 63,
    "weather_code": 0,
    "wind_speed_10m": 12.3,
    "pressure_msl": 1013.4,
    "precipitation": 0.6
  },
  "daily": {
    "time": ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"],
    "temperature_2m_min": [14.2, 15.1, 16.0, 15.4, 14.8],
    "temperature_2m_max": [22.6, 23.0, 24.1, 22.8, 21.9],
    "weather_code": [0, 1, 2, 61, 3],
    "precipitation_probability_max": [0, 10, 20, 70, 30],
    "precipitation_sum": [0.0, 0.0, 0.4, 5.2, 1.1],
    "wind_speed_10m_max": [12.3, 14.0, 11.2, 18.5, 16.1]
  }
}
```

Mapeamento para o domínio:

- `current.temperature_2m` → `CurrentWeather.temperatureC`; `relative_humidity_2m` → `humidityPercent`; `weather_code` → `conditionCode`; `wind_speed_10m` → `windSpeedKmh`; `pressure_msl` → `pressureHpa`; `precipitation` → `precipitationMm`.
- As propriedades do objeto `daily` são arrays paralelos: para cada índice `i`, `time[i]` → `ForecastDay.date`, `temperature_2m_min[i]` → `temperatureMinC`, `temperature_2m_max[i]` → `temperatureMaxC`, `weather_code[i]` → `conditionCode`, `precipitation_probability_max[i]` → `precipitationProbabilityPercent`, `precipitation_sum[i]` → `precipitationSumMm` e `wind_speed_10m_max[i]` → `windSpeedMaxKmh`.
- A `City` original selecionada é mantida em `WeatherData.city`; coordenadas da resposta Forecast não substituem a localidade escolhida. `WeatherData.fetchedAt` é criado pelo cliente quando a resposta termina, e `stale` é estado local. `Unit` também é estado de apresentação; a API sempre recebe temperaturas em Celsius e não participa da alternância °C/°F.
- Validar a estrutura e o comprimento dos arrays antes do mapeamento. Campos numéricos ausentes ou inválidos viram `null`; arrays desalinhados ou payload ilegível produzem `invalid-response`. Usar `daily.time` como data-calendário sem conversão por `Date` que possa mudar o dia (FR-02, FR-03, AC-03.1, AC-03.2).
- Exibir atribuição visível ao provedor. Confirmar termos, limites e texto requerido antes de publicar (NFR-05).

Cada chamada tem deadline de 8.000 ms com cancelamento via `AbortController`. Não repetir automaticamente; retry manual repete apenas a operação que falhou (FR-06, NFR-04).

## State Management

O estado de domínio vive em `useWeather`; não usar store global nem persistência. O `SearchBar` mantém apenas o texto enquanto é editado e o foco/índice ativo de sugestões. O hook guarda a consulta normalizada enviada, busca, cidade ativa, resultado meteorológico e unidade, para preservar a operação em retry.

Busca usa estados discriminados explícitos:

```ts
type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; cities: City[] }
  | { status: "empty" }
  | { status: "error"; error: WeatherError };
```

`idle` significa que ainda não houve busca (ou o campo está vazio); input vazio não envia request. `loading` dura até a conclusão; `success` contém pelo menos uma cidade selecionável; `empty` é resposta válida sem resultados; `error` representa falha técnica.

Consulta meteorológica usa `idle`, `loading`, `success` e `error`; não usa `empty`, pois dados meteorológicos parciais são representados por campos `null` no sucesso:

```ts
type WeatherState =
  | { status: "idle" }
  | { status: "loading"; previousData?: WeatherData }
  | { status: "success"; data: WeatherData }
  | { status: "error"; error: WeatherError; previousData?: WeatherData };
```

`previousData` só existe durante atualização da mesma cidade e em falha dessa atualização; em falha recebe `stale: true` e mantém o `fetchedAt` anterior. Ao trocar de cidade, não manter dados da cidade anterior no estado visual.

`Unit` vive no hook, inicia em `"celsius"` e dura somente até a página ser recarregada. O domínio mantém todos os valores de temperatura em Celsius. Na renderização, uma função pura deriva Celsius ou Fahrenheit dos mesmos dados; alternar unidade não altera `WeatherData`, não atualiza estado de rede e não faz request.

Desabilitar envio/refresh durante a mesma operação. AbortController cancela request obsoleta quando muda a cidade; cancelamento intencional não vira estado `error` nem pode sobrescrever resultado de request mais recente.

## Error Handling

Representar falhas técnicas de forma tipada, sem tratar lista vazia como exceção:

```ts
type WeatherError =
  | { kind: "network" }
  | { kind: "http"; status: number }
  | { kind: "timeout" }
  | { kind: "invalid-response" };
```

- **Rede:** falha de conectividade mapeia para `kind: "network"`; encerrar loading, preservar consulta/cidade e apresentar mensagem pt-BR com retry.
- **API:** resposta HTTP não-2xx mapeia para `kind: "http"` com status; não exibir corpo técnico. Payload ilegível, arrays diários desalinhados ou estrutura incompatível mapeiam para `kind: "invalid-response"`. Mensagem técnica não deve ser confundida com cidade não encontrada.
- **Timeout:** aos 8.000 ms, abortar a chamada e mapear para `kind: "timeout"`; encerrar loading e oferecer retry manual, sem repetição automática. Abort por troca de cidade é cancelamento intencional, não timeout nem erro visível.
- **Sem resultados:** resposta de geocoding bem-sucedida sem localidades transiciona para `SearchState.empty`, apresenta “Nenhuma cidade encontrada. Confira a grafia ou tente outro nome.” e não chama Forecast.
- **Resposta parcial:** campos numéricos ausentes/inválidos tornam-se `null` e são exibidos como “Indisponível”; não usar zero nem estimativa. Ausência de temperatura atual ou mínima/máxima diária torna indisponível só a seção/dia afetado, preservando outros dados válidos. O snapshot continua `success` com lacunas identificadas; condição WMO desconhecida usa “Condição não disponível”.
- **Retry:** repetir somente a operação que falhou, com a cidade/consulta preservada e uma chamada por ativação. Em atualização da mesma cidade, manter `previousData`; ao falhar, marcar stale e não substituir `fetchedAt`. Ao selecionar cidade diferente, limpar o dado anterior do estado visível (FR-05, FR-06, FR-07).

## Testing Strategy

- **Funções puras (Vitest):** testar conversão °C/°F sem rede, incluindo temperaturas negativas; arredondamento para inteiro e empate em `0,5`; formatação pt-BR; cálculo/format de datas ao redor da meia-noite UTC; mapeamento de códigos WMO conhecido e desconhecido. Usar tabelas de valores esperados e verificar que as entradas não são mutadas.
- **Services (Vitest):** substituir `fetch` por mock e verificar URL, método, parâmetros e codificação de nomes com acentos; mapear exemplos Geocoding/Forecast para os tipos de domínio; cobrir lista vazia, HTTP não-2xx, rejeição de rede, payload inválido/parcial e arrays diários desalinhados. Usar relógio falso para avançar 8.000 ms e confirmar abort/timeout. Não chamar a API real nos testes.
- **Hooks e componentes (Vitest + Testing Library):** testar transições de `idle`, `loading`, `success`, `empty` e `error`; renderizar cada componente em loading, erro, vazio e sucesso com fixtures; testar input vazio, envio por Enter/botão, escolha de homônimo, retry, troca de cidade e refresh falho. Interagir e consultar por roles/labels acessíveis. Stubar o service nos testes do hook/UI para isolar essas camadas.
- **Playwright:** cobrir no browser o fluxo buscar → escolher cidade → consultar atual e cinco dias → alternar unidade → atualizar; validar mensagem de nenhum resultado, falha/timeout, preservação de dados obsoletos e retry. Interceptar e simular endpoints Open-Meteo para resultados determinísticos; não depender de disponibilidade externa. Exercitar teclado e layout nas larguras NFR-02, incluindo 320 e 375 px.
- **Qualidade não funcional:** executar Lighthouse CI com o perfil fixado em NFR-01 e verificar LCP abaixo de 2 s no p75 de oito execuções; rodar auditoria WCAG 2.2 AA e teste manual de teclado/leitor de tela; validar navegadores e versões de NFR-09.
- **Rastreabilidade:** usar a [matriz de rastreabilidade](../specs/weather-app-spec.md) para derivar testes por US, AC e NFR. Toda AC deve ter teste automatizado ou justificativa explícita se só puder ser verificada manualmente.

## Risks & Trade-offs

| Decisão | Alternativa considerada | Trade-off e mitigação |
| --- | --- | --- |
| Cliente React acessa Open-Meteo diretamente; sem backend próprio. | Backend/BFF para intermediar requisições. | Evita infraestrutura e autenticação fora do escopo; mantém a dependência de disponibilidade, CORS e termos do provedor. Confirmar CORS/termos antes da publicação e tratar falhas no cliente. |
| `fetch` nativo e hook local (`useWeather`). | Axios e/ou biblioteca global de cache/estado. | Menos dependências e fluxo explícito; timeout, retry, estados e concorrência ficam sob responsabilidade do app. Cobrir esses contratos com testes de service e hook. |
| Testes automatizados usam endpoints simulados. | Fazer chamadas à Open-Meteo real em unit/E2E. | Resultados rápidos e determinísticos, sem flakiness por rede ou limites; mocks não detectam mudanças reais no contrato da API. Conferir payload e termos do provedor antes de publicar e atualizar fixtures quando o contrato mudar. |
| Sem persistência local, cache durável ou modo offline. | `localStorage`, IndexedDB ou Service Worker. | Reduz escopo e dados retidos; cidade e unidade se perdem ao recarregar e não há consulta offline. Aceito pelo MVP e explicitado em Out of Scope. |
| Celsius como representação interna; conversão na renderização. | Solicitar os dados novamente em Fahrenheit ou armazenar ambas as unidades. | Uma única fonte de verdade e nenhuma chamada extra ao alternar; requer conversão/arredondamento testados, inclusive negativos e empates. |
| Resumo diário para hoje + quatro dias em `America/Sao_Paulo`. | Previsão horária ou datas locais de cada cidade. | Menos dados e interface mais simples, alinhadas ao MVP; cidades de outros fusos usam calendário de Brasília e não têm detalhamento intradiário. Essa regra fica visível na especificação. |
| Open-Meteo sem API key e sem SLA contratado. | Provedor com chave, backend ou garantia de disponibilidade. | Sem segredo ou custo de backend no cliente, mas sem controle sobre disponibilidade, limites e formato externo. Timeout, validação, estados de falha/retry e confirmação de termos/atribuição antes da publicação mitigam o risco. |