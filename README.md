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

## LPL-Compatible Local Study

This repository is designed to support a personal study workflow for Language, Proof and Logic without publishing copyrighted textbook content.

Public code includes:

- LPL chapter metadata in `src/lpl/chapterMap.ts`
- Exercise metadata types in `src/lpl/exerciseSchema.ts`
- A private-content convention for local-only notes

Private local files belong under:

```text
private-content/lpl/
```

Everything inside `private-content/` is ignored by git except the local README and placeholder. Put your personal exercise notes, proof attempts, and custom world files there.

## Development

```bash
npm run build
npm run lint
```

Important files:

- `src/logic/`: tokenizer, parser, semantic evaluator, predicates
- `src/curriculum/`: chapters, worlds, and level data
- `src/lpl/`: LPL-compatible metadata schema and chapter map
- `src/App.tsx`: learning interface and task-mode UI
- `src/App.css`: application layout and visual system

See `docs/ARCHITECTURE.md` for the internal structure and `CONTRIBUTING.md` for adding new levels.

## Roadmap

The current project is version `0.3.0`: a playable structured curriculum with a maintainable code layout and local-only LPL study scaffold. The next major track is Boole mode: truth tables, tautology checks, equivalence, and entailment.

See `ROADMAP.md` for the longer plan.

## License

MIT
