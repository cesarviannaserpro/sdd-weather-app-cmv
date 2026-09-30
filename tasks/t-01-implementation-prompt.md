# Prompt de implementação — T-01

Você é o **Code Agent** deste repositório. Implemente somente a tarefa abaixo, seguindo a especificação e o plano técnico já aprovados.

## Tarefa

**T-01 — Definir contratos de domínio**

Criar os contratos TypeScript compartilhados do Weather App: `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `SearchState`, `WeatherState` e `WeatherError`.

## Contexto do produto

O aplicativo é um cliente React + Vite em TypeScript strict que consulta Open-Meteo. A arquitetura separa:

- `types`: contratos compartilhados do domínio;
- `lib`: funções puras de conversão e formatação;
- `services`: HTTP, validação e normalização de payloads externos;
- `hooks`: orquestração de estado;
- `components`: apresentação e eventos.

Este trabalho é a fundação do domínio. Os tipos não devem importar React, DOM, services, componentes ou bibliotecas de estado.

## Arquivo a criar ou editar

- `src/types/weather.ts`

Não criar ou editar outros arquivos, salvo se uma correção mínima de configuração TypeScript for indispensável e diretamente causada por este contrato. Não criar ainda funções de conversão, formatação, mapeamento WMO, chamadas HTTP ou componentes.

## Contrato obrigatório

Defina os seguintes tipos exportados:

```ts
export type Unit = "celsius" | "fahrenheit";

export interface City {
  id: number;
  name: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  conditionCode: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  pressureHpa: number | null;
  precipitationMm: number | null;
}

export interface ForecastDay {
  date: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  conditionCode: number | null;
  precipitationProbabilityPercent: number | null;
  precipitationSumMm: number | null;
  windSpeedMaxKmh: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
  stale: boolean;
}

export type WeatherError =
  | { kind: "network" }
  | { kind: "http"; status: number }
  | { kind: "timeout" }
  | { kind: "invalid-response" };

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; cities: City[] }
  | { status: "empty" }
  | { status: "error"; error: WeatherError };

export type WeatherState =
  | { status: "idle" }
  | { status: "loading"; previousData?: WeatherData }
  | { status: "success"; data: WeatherData }
  | { status: "error"; error: WeatherError; previousData?: WeatherData };
```

## Regras de domínio

- Temperaturas armazenadas no domínio usam Celsius; Fahrenheit é somente unidade de apresentação.
- Campos numéricos opcionais ou ausentes são representados por `null`, nunca por zero ou string vazia.
- `ForecastDay.date` é uma data-calendário `YYYY-MM-DD` em `America/Sao_Paulo`, não um instante UTC.
- `WeatherData.fetchedAt` é uma string ISO 8601 em UTC criada quando a resposta é recebida.
- `WeatherData.stale` indica que o snapshot em memória não foi atualizado após falha de atualização.
- `SearchState.empty` representa uma busca válida sem localidades; não é erro técnico.
- `WeatherState` não possui estado `empty`; dados meteorológicos parciais usam campos `null` dentro de `success`.
- `previousData` só será usado durante atualização da mesma cidade ou após falha dessa atualização.
- Não usar `any`, enums, valores sentinela ou campos adicionais não previstos no contrato.

## Critérios de aceite

1. `src/types/weather.ts` exporta exatamente os contratos necessários para cidade, clima atual, previsão, snapshot, unidade, estados e erros.
2. `Unit` aceita somente `"celsius"` e `"fahrenheit"`.
3. Todos os campos numéricos opcionais do contrato aceitam `number | null`; nenhuma interface substitui indisponibilidade por zero.
4. `SearchState` contém exatamente os estados `idle`, `loading`, `success`, `empty` e `error`, com `cities` em sucesso e `WeatherError` em erro.
5. `WeatherState` contém exatamente os estados `idle`, `loading`, `success` e `error`, com `WeatherData` em sucesso e `previousData` opcional nos estados de atualização/erro.
6. `WeatherError` discrimina `network`, `http` com `status: number`, `timeout` e `invalid-response`.
7. O arquivo compila em TypeScript strict e não importa React, DOM, rede, services ou componentes.
8. Nenhum comportamento de UI, conversão, formatação ou acesso à API é implementado nesta tarefa.

## Validação obrigatória

Execute, na raiz do projeto:

```bash
pnpm lint
pnpm build
pnpm test
```

Não altere testes ou implemente tarefas posteriores para contornar uma falha. Se um comando falhar por uma causa preexistente, registre o comando, a mensagem principal e informe que o problema está fora do escopo da T-01.

## Resposta final esperada do agente

Informe:

- arquivo criado ou alterado;
- contratos implementados;
- resultado de `pnpm lint`, `pnpm build` e `pnpm test`;
- qualquer bloqueio ou diagnóstico preexistente.