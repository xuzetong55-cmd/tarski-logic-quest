# Architecture

Tarski Logic Quest is a Vite + React + TypeScript app. It is intentionally small and mostly data-driven.

## Core Files

```text
src/logic/
src/curriculum/
src/lpl/
src/components/
src/App.tsx
src/App.css
```

## Logic Engine

`src/logic/` contains:

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

`src/curriculum/` contains the public curriculum:

- `levels.ts`: level data
- `chapters.ts`: grouped navigation structure
- `worlds.ts`: reusable Tarski worlds

Levels are discriminated by `mode`:

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

The larger UI pieces live under `src/components/`:

- `components/world/WorldBoard.tsx`
- `components/mission/MissionPanel.tsx`
- `components/sandbox/Sandbox.tsx`

`src/App.css` keeps the app as a dense learning workspace rather than a landing page. Cards are used only for bounded tools, candidate choices, and repeated object rows.

## LPL Metadata

`src/lpl/` contains public metadata only:

- `chapterMap.ts`: LPL-compatible chapter structure and placeholders
- `exerciseSchema.ts`: typed references for local-only exercise notes

Do not commit textbook exercise text. Personal notes and answers belong under `private-content/`, which is ignored by git.

## Future Refactors

As the project grows, likely split points are:

- `src/logic/propositional/`
- `src/logic/firstOrder/`
- `src/logic/proof/`
- `src/components/boole/`
- `src/components/fitch/`
- `src/components/tarski/`
