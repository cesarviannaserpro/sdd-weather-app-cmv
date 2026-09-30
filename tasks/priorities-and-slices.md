# Prioridades, tamanhos e fatias verticais

Esta classificação é relativa ao MVP:

- **P0:** necessário para o primeiro caminho utilizável e demonstrável.
- **P1:** necessário para completar resiliência, acessibilidade ou cobertura funcional do MVP.
- **P2:** hardening de publicação, performance, compatibilidade e conformidade final.
- **S:** pequena, com uma regra ou componente isolado.
- **M:** envolve uma fronteira de aplicação ou alguns arquivos relacionados.
- **G:** envolve coordenação entre estados, camadas ou vários cenários de validação.

P2 não significa descartável: as tarefas P2 devem terminar antes da publicação quando o requisito correspondente se aplicar.

## Classificação do backlog

| Tarefa | Prioridade | Tamanho | Motivo resumido |
| --- | --- | --- | --- |
| T-01 — Contratos de domínio | P0 | M | Define os tipos consumidos por todas as camadas. |
| T-02 — Conversão de temperatura | P0 | S | Regra pura isolada, necessária para a unidade exibida. |
| T-03 — Formatação de datas e valores | P0 | S | Regra pura usada pela apresentação do clima. |
| T-04 — Descrições WMO | P0 | S | Mapeamento puro usado nas condições atuais e previsão. |
| T-05 — Entrypoint e estilos globais | P0 | M | Base executável e responsiva da aplicação. |
| T-06 — Requisição com deadline | P0 | M | Fronteira de rede compartilhada por Geocoding e Forecast. |
| T-07 — Busca de cidades | P0 | M | Primeiro fluxo de dados visível para o usuário. |
| T-08 — Normalização do Forecast | P0 | M | Produz o snapshot meteorológico do MVP. |
| T-09 — Validação de respostas parciais | P1 | M | Protege a UI contra payloads incompletos e inválidos. |
| T-10 — Busca e seleção no hook | P0 | M | Orquestra cidade ativa e consulta. |
| T-11 — Clima, retry, refresh e unidade no hook | P0 | G | Coordena estados, concorrência, atualização e unidade. |
| T-12 — Barra de busca | P0 | M | Primeiro controle de interação do produto. |
| T-13 — Loading e vazio | P0 | S | Torna busca e espera compreensíveis. |
| T-14 — Erro e retry | P1 | S | Completa a recuperação de falhas técnicas. |
| T-15 — Clima atual | P0 | M | Entrega o valor principal da consulta. |
| T-16 — Cartão de previsão | P0 | M | Apresenta um dia do forecast. |
| T-17 — Lista de previsão | P0 | S | Compõe os cinco dias do MVP. |
| T-18 — Controle de unidade | P0 | S | Expõe a alternância sem nova chamada. |
| T-19 — Composição da tela | P0 | M | Torna a fatia completa navegável. |
| T-20 — Atribuição ao provedor | P1 | S | Cumpre integração e atribuição antes da publicação. |
| T-21 — Teste unitário de conversão | P0 | S | Evita regressão na regra de unidade. |
| T-22 — Teste de formatação e WMO | P0 | S | Fixa datas, formato e tradução. |
| T-23 — Teste Geocoding com mock | P0 | M | Fixa contrato externo sem rede real. |
| T-24 — Teste Forecast com mock | P0 | M | Fixa normalização, erros e timeout. |
| T-25 — Teste de transições do hook | P0 | M | Verifica concorrência e estados de domínio. |
| T-26 — Teste da barra de busca | P0 | S | Verifica envio e teclado. |
| T-27 — Teste dos estados visuais | P1 | S | Verifica loading, vazio, erro e retry. |
| T-28 — Teste da apresentação meteorológica | P0 | M | Verifica snapshot completo e parcial. |
| T-29 — Teste do controle de unidade | P0 | S | Verifica interação e preservação das demais métricas. |
| T-30 — Teste de integração da tela | P0 | M | Confirma o fluxo entre App, hook e componentes. |
| T-31 — E2E do fluxo principal desktop/mobile | P0 | M | Valida o produto utilizável no navegador. |
| T-32 — E2E de falhas e viewports | P1 | M | Verifica resiliência e larguras previstas. |
| T-33 — Gates do projeto | P0 | S | Impede avanço com lint, build ou testes quebrados. |
| T-34 — Acessibilidade, performance e compatibilidade | P2 | G | Reúne auditorias e múltiplas plataformas de publicação. |
| T-35 — Termos e atribuição Open-Meteo | P2 | S | Gate de conformidade e publicação. |

## Sequência em fatias verticais

As tarefas dentro de uma fatia continuam respeitando suas dependências. O checkpoint é o resultado observável ao final da fatia, e não apenas a conclusão de uma camada isolada.

| Ordem | Fatia | Tarefas principais | Checkpoint visível |
| --- | --- | --- | --- |
| 1 | Shell executável | T-01, T-02, T-03, T-04, T-05 | Aplicação abre, renderiza o shell e possui regras de data, unidade e condição prontas. |
| 2 | Primeira fatia meteorológica visível | T-06 a T-20 | Pessoa busca e seleciona uma cidade, vê condições atuais e cinco dias, alterna unidade e recebe estados de loading/erro/vazio; a atribuição já aparece. |
| 3 | Testes da fatia vertical | T-21 a T-30 | Regras, services, hook, componentes e integração têm testes determinísticos antes do E2E. |
| 4 | Fluxo navegável no browser | T-31, T-32, T-33 | Caminho completo e falhas passam no browser em desktop e mobile; lint, build e testes terminam com código 0. |
| 5 | Hardening e publicação | T-34, T-35 | Acessibilidade, performance, compatibilidade e termos são verificados antes da publicação. |

## Estratégia de entrega

Priorizar as fatias 1 e 2 para obter uma tela interativa cedo. Em seguida, fechar a fatia 3 antes de investir em acabamento: ela transforma a implementação em uma base testada. A fatia 4 valida o fluxo real no navegador e a fatia 5 fecha os riscos de publicação.