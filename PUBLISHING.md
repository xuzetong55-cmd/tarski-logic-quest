# Publishing

This repository is ready to publish to GitHub.

## Option A: GitHub Website

1. Open GitHub and create an empty repository named `tarski-logic-quest`.
2. Do not initialize it with a README, license, or `.gitignore`; this project already has them.
3. Copy the repository URL.
4. Run:

```bash
git remote add origin https://github.com/<your-username>/tarski-logic-quest.git
git push -u origin main
```

## Option B: GitHub CLI

If `gh` is installed and authenticated:

```bash
gh repo create tarski-logic-quest --public --source=. --remote=origin --push
```

For a private repository:

```bash
gh repo create tarski-logic-quest --private --source=. --remote=origin --push
```

## Verify

After pushing, check:

```bash
git remote -v
git status
```

GitHub Actions should run the `CI` workflow automatically on the first push.
