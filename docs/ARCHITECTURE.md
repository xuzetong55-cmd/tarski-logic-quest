# Architecture

Tarski Logic Quest is a Vite + React + TypeScript app. It is intentionally small and mostly data-driven.

## Core Files

```text
src/logic.ts
src/levels.ts
src/App.tsx
src/App.css
```

## Logic Engine

`src/logic.ts` contains:

- A tokenizer for Unicode and ASCII logical syntax
- A recursive-descent parser
- A semantic evaluator over finite Tarski worlds
- Built-in predicates for shapes, sizes, positions, and relations

The evaluator supports:

- Atomic predicates
- Equality
- Negation
- Conjunction
- Disjunction
- Implication
- Universal quantification
- Existential quantification

## Curriculum Data

`src/levels.ts` contains all chapters and levels. Levels are discriminated by `mode`:

```ts
type LevelMode = 'judge' | 'construct' | 'proof'
```

The three level shapes are:

- `JudgeLevel`: evaluate one formula in one world.
- `ConstructLevel`: choose a model or countermodel from candidate worlds.
- `ProofLevel`: choose a proof rule or transformation step.

This lets the curriculum grow without rewriting the UI for every new concept.

## UI

`src/App.tsx` renders:

- Chapter navigation
- The current Tarski world
- The mode-specific mission panel
- The formula sandbox

`src/App.css` keeps the app as a dense learning workspace rather than a landing page. Cards are used only for bounded tools, candidate choices, and repeated object rows.

## Future Refactors

As the project grows, likely split points are:

- `src/components/WorldBoard.tsx`
- `src/components/MissionPanel.tsx`
- `src/components/Sandbox.tsx`
- `src/logic/parser.ts`
- `src/logic/evaluator.ts`
- `src/curriculum/levels.ts`
