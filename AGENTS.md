# Repository Contribution Guidelines

To ensure consistency with CI, run the following commands before committing code:

```bash
npm ci
npm run lint --if-present
npm run type-check --if-present || npx tsc --noEmit
npm run build
npm test --if-present
```

Use Node.js 20.x for parity with GitHub Actions. All Pull Requests should pass these commands locally prior to submission.
