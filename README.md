# Tarski Logic Quest

Tarski Logic Quest is a browser-based learning game for first-order logic. It uses small Tarski-style worlds to make formulas, quantifiers, models, countermodels, proof rules, and automated reasoning feel concrete.

The project is designed as a long-term learning tool: start with truth in a world, then move toward syntax, model semantics, quantifier mastery, natural deduction, resolution, and core metatheory.

## Features

- 52 staged levels across 7 chapters
- Three task modes: truth judgment, model construction, and proof-rule training
- A small first-order formula parser and evaluator
- Tarski-world boards with shapes, sizes, positions, and relations
- A sandbox for testing formulas against the current world
- Unicode and ASCII formula syntax

## Chapters

- Chapter 0: Tarski World Basics
- Chapter 1: Syntax and Variables
- Chapter 2: Model Semantics
- Chapter 3: Quantifier Mastery
- Chapter 4: Natural Deduction
- Chapter 5: Automated Reasoning and Normal Forms
- Chapter 6: Metatheory Map

## Run Locally

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
```

## Formula Syntax

Unicode symbols are supported:

```text
¬ ∧ ∨ → ∀ ∃ =
```

ASCII alternatives are also supported:

```text
! && || -> forall exists =
```

Examples:

```text
Cube(A)
LeftOf(B, C)
Cube(A) ∧ Small(A)
∀x (Cube(x) → Small(x))
∃x ∀y (x = y ∨ LeftOf(x, y))
```

Available predicates:

```text
Cube, Tet, Dodec
Small, Medium, Large
LeftOf, RightOf, FrontOf, BackOf
SameRow, SameColumn
SameShape, SameSize
Adjacent, Between
```

## Development

```bash
npm run build
npm run lint
```

Important files:

- `src/logic.ts`: tokenizer, parser, semantic evaluator, predicates
- `src/levels.ts`: chapters and level data
- `src/App.tsx`: learning interface and task-mode UI
- `src/App.css`: application layout and visual system

See `docs/ARCHITECTURE.md` for the internal structure and `CONTRIBUTING.md` for adding new levels.

## Roadmap

The current project is version `0.1.0`: a playable, structured curriculum. The next major step is proof mode 2.0: step-by-step proof construction rather than multiple-choice proof-rule training.

See `ROADMAP.md` for the longer plan.

## License

MIT
