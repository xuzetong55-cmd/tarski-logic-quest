# Roadmap

## 0.1.0: Playable Curriculum

- 52 levels across first-order logic fundamentals
- Truth-judgment levels
- Candidate-world construction levels
- Multiple-choice proof-rule levels
- Formula sandbox

## 0.2.0: Maintainable Project Structure

- Split logic engine into tokenizer, parser, evaluator, predicates, and AST modules
- Split UI into world, mission, and sandbox components
- Split curriculum into levels, worlds, and chapter grouping

## 0.3.0: LPL-Compatible Local Study Scaffold

- Add LPL-compatible chapter metadata
- Add exercise metadata schema
- Add ignored `private-content/` workspace for local textbook notes and answers
- Document copyright-safe workflow for personal LPL study

## 0.4.0: Boole Mode MVP

- Propositional parser
- Truth table generation
- Tautology, contradiction, contingency checks
- Equivalence and entailment checks

## 0.5.0: Tarski World Builder

- Drag objects on the board
- Add/remove objects
- Edit object shape and size
- Save custom worlds
- Solve construction levels by building a world directly

## 0.6.0: Tarski Exercise Engine

- Sentence-set satisfaction
- Model and countermodel construction
- Better quantifier diagnostics
- Local world file binding for LPL-compatible exercises

## 0.7.0: Proof Mode 2.0

- Step-by-step proof editor
- Line references
- Rule validation for `∧I`, `∧E`, `∨I`, `→E`, `→I`, `∀E`, `∃I`
- Better feedback for invalid proof steps

## 0.8.0: Logic Engine Expansion

- Safer parser diagnostics
- Free-variable analysis
- Formula normalization helpers
- More predicates and custom predicate tables
- Formula equivalence challenges

## 0.9.0: LPL Study Workbench

- Chapter-level progress
- Local exercise index
- Bind notes, worlds, proofs, and truth-table attempts to exercise refs
- Review queue and retry status

## 1.0.0: LPL-Compatible Local Study Suite

- Stable Boole, Tarski, and Fitch modes
- Local-only LPL content support
- Import/export local study packs

## Later: Automated Reasoning Lab

- Normal-form transformation walkthroughs
- Skolemization visualizer
- Unification exercises
- Resolution proof trees

## Later: Product Polish

- Progress persistence beyond local storage
- Import/export level packs
- Bilingual UI toggle
- Teacher mode for creating classroom sequences
- Static hosting through GitHub Pages
