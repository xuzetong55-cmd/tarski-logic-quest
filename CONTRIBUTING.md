# Contributing

Tarski Logic Quest is intentionally data-first. Most public learning content can be added by editing `src/curriculum/levels.ts`.

## Add a Level

Choose one of the existing helpers:

```ts
judge({ ... })
construct({ ... })
proof({ ... })
```

Use `judge` when the learner should decide whether a formula is true in a given world.

Use `construct` when the learner should choose a model or countermodel from candidate worlds.

Use `proof` when the learner should identify the next proof rule or transformation step.

## Add a Predicate

1. Add the predicate name to `predicateNames` in `src/logic/predicates.ts`.
2. Add a help example to `predicateHelp`.
3. Implement the semantic case in `evaluatePredicate`.
4. Add at least one level that exercises the predicate.
5. Run:

```bash
npm run build
npm run lint
```

## Level Writing Style

- Keep each level focused on one concept.
- Prefer small worlds with obvious counterexamples.
- Write explanations that name the exact object or rule that matters.
- Introduce formal vocabulary only after the learner has seen the intuition.
- When a formula is false, explain the shortest counterexample.

## Pull Request Checklist

- The app builds with `npm run build`.
- Lint passes with `npm run lint`.
- New levels are reachable from the chapter list.
- The sandbox still works on the affected world.

## Private LPL Notes

Do not commit copyrighted exercise text or personal answer notes. Put local-only study material in:

```text
private-content/lpl/
```

That directory is ignored by git except for the placeholder and README.
