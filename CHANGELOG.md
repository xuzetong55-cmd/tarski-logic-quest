# Changelog

## 0.5.0

- Added Tarski World Builder as a new workspace mode.
- Added editable worlds with object creation, deletion, movement, shape, size, name, and coordinate controls.
- Added live first-order formula checking against the custom world.
- Added local storage persistence for the custom builder world.
- Added JSON import and export for local world files.
- Improved the local macOS launcher so version changes restart the bundled local server.

## 0.4.0

- Added Boole Mode as a propositional-logic workbench.
- Added a propositional parser and truth-table evaluator.
- Added tautology, contradiction, and contingency classification.
- Added formula equivalence and entailment checks with counterexample rows.
- Added a Tarski/Boole workspace switch in the main app.

## 0.3.2

- Added a generated macOS app icon for Tarski Logic Quest.
- Wired `CFBundleIconFile` into the local app bundle.
- Added `npm run icon` and made `npm run dist:mac` regenerate icon assets before packaging.

## 0.3.1

- Added a lightweight macOS app launcher package.
- Added `npm run dist:mac` to build `release/Tarski Logic Quest.app`.
- The app starts a local static server on `127.0.0.1:17673` and opens the bundled app in the browser.
- Kept generated app artifacts out of git with `release/`.

## 0.3.0

- Split the logic engine into AST, tokenizer, parser, evaluator, and predicates modules.
- Split UI into world board, mission panel, and sandbox components.
- Split curriculum into levels, reusable worlds, and chapter grouping.
- Added LPL-compatible public metadata under `src/lpl/`.
- Added ignored `private-content/` workspace for local-only LPL notes and answers.
- Updated documentation for the long-term Boole, Tarski, and Fitch roadmap.

## 0.1.0

- Created the initial playable curriculum.
- Added 52 levels across Tarski-world basics, syntax, model semantics, quantifiers, proof training, automated reasoning, and metatheory.
- Added truth-judgment, construction, and proof-rule training modes.
- Added formula sandbox and finite-world evaluator.
