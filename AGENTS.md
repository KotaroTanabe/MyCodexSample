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


- 極力実装した機能に対するテストを書くこと
    - When writing point calculation tests, include a comment explaining the computation and why the expected score should result (e.g., "今の実装だと◯◯の計算になって、だからこの点数になるはずだ").
- README.mdに、実装予定の機能とそれぞれの実装状況を書くこと。チェックリスト方式で書くことを推奨する。ただし、bugfixの場合はリストに書かないでよい。
