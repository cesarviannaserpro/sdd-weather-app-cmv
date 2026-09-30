---
mode: agent
description: 'Gera uma especificação de produto completa a partir de um briefing de negócio.'
---

# Prompt — Gerar Especificação

Você é o **Spec Agent**. A partir do briefing abaixo, da análise de discovery
em `specs/discovery.md` e das personas em `specs/personas.md` (quando existirem),
gere uma especificação de produto completa e sem ambiguidades. Trate as personas
como hipóteses, não como pesquisa validada.

## Briefing

> Cole aqui o briefing de negócio.

## Tarefa

Crie/atualize `specs/weather-app-spec.md` com as seções:

1. Overview
2. Functional Requirements
3. User Stories (Como [persona de `specs/personas.md`], quero [ação] para [valor])
4. Acceptance Criteria (verificáveis, por story)
5. Non-Functional Requirements (performance, acessibilidade, responsividade)
6. Edge Cases (entrada inválida, falha de API, timeout, vazio)
7. Assumptions
8. Risks (com mitigação)
9. Out of Scope
10. Open Questions

## Regras

- Não escreva código.
- Não invente respostas para ambiguidades — registre-as em Open Questions.
- Cada requisito funcional precisa de pelo menos um critério de aceite.
- Use as personas para contextualizar histórias e critérios, sem inventar atributos ou necessidades não documentados.
