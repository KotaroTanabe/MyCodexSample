# Mahjong Web App

1人用（AI 3人を含む）シングルページ麻雀アプリ  
Codex/CopilotなどAI補助によるコーディング演習・検証用プロジェクト

---

## 特徴

- **プレイ人数**: プレイヤー1名＋AI対戦相手3名
- **SPA構成**: React + Vite + TypeScript + Tailwind CSS
- **フロントエンドのみ**: サーバ不要、全てブラウザで完結
- **レスポンシブ対応**: PC/スマホどちらでも操作可能
- **AIロジック**: TypeScriptで実装した簡易思考ルーチン搭載

---

## クイックスタート

### 1. クローン & セットアップ

```sh
git clone https://github.com/KotaroTanabe/MyCodexSample.git
cd MyCodexSample
npm install
```

### 2. 開発サーバ起動

```sh
npm run dev
```
- ブラウザで `http://localhost:5173/` を開く

### 3. ビルド & ローカル確認

```sh
npm run build
npm run preview
```
- `dist/` 配下が成果物。
- `npm run preview` でローカル起動（SPAルーティング考慮）

### 4. テスト実行

```sh
npm test
```
- 実行前に **必ず** `npm install` を実行して依存パッケージをインストールする

---

## CI/CD（GitHub Actions & Pages）

- **push/PR時に自動ビルド・テスト**
- 成功時 `dist` アーティファクトをダウンロード可能
- PR作成時にプレビュー環境へ自動デプロイ
  - Actionsのワークフロー実行ページの"Deploy to GitHub Pages"ステップに表示される`Preview URL`からアクセス
- mainブランチpush時に **GitHub Pagesへ自動デプロイ**
- PR作成時は **Pagesプレビュー** を自動発行（`steps.deployment.outputs.page_url` を確認）
- 公開URL例：
  `https://kotarotanabe.github.io/MyCodexSample/`

### 成果物をダウンロードして動作確認

1. [Actionsタブ](https://github.com/KotaroTanabe/MyCodexSample/actions)で最新ジョブを選択
2. `dist` アーティファクトをダウンロード
3. zip展開して `index.html` をダブルクリック

---

## デプロイ

- GitHub Pages, Netlify等で `dist/` を静的公開するだけでOK
- `vite.config.js` の `base` をリポジトリ名に合わせて必ず修正

---

## 構成・主要ファイル

- `src/`
  - `types/mahjong.ts` … 牌・プレイヤー等の型定義
  - `components/` … React各種コンポーネント
- `public/` … favicon等
- `tailwind.config.js`, `postcss.config.js` … CSSビルド
- `vite.config.js` … Pages対応
- `.github/workflows/ci.yml` … CIワークフロー

---

## 開発メモ

- 役判定／点数計算、より高度なAIは未実装（PR歓迎）
- テスト追加・UI改良も歓迎

---

## ライセンス

MIT
