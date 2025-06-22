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
- **役一覧ヘルプ**: スコアボードの「?」ボタンから標準的な全役を確認可能
- **向聴表示**: 自分の手牌の向聴数を画面に表示
- **点数計算**: 翻数と符を計算して自動で得点を表示
- **符計算**: 面子構成や待ち形に応じて基礎符から加算
- **副露対応**: チー・ポン・カンを実行可能
- **符計算クイズ**: モード切替で符計算の練習が可能。問題ごとにロン/ツモがランダムに表示されます
- **向聴数クイズ**: 任意の手牌の向聴数を当て、その計算根拠も確認できるデバッグ用クイズモード

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
- 鳴き可能なときは画面下部に「チー」「ポン」「カン」ボタンが表示されます。クリックして副露できます。

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

### 5. Lint

```sh
npm run lint
```
- `.eslintrc.json` を利用した ESLint 設定で、TypeScript/React のコードをチェックできます。

### 符計算クイズモード

- 画面上部のモード切替ドロップダウンから「符計算クイズ」を選ぶと、通常の対局モードからクイズモードへ切り替えられます。
- 提示される和了形の符を入力すると、ゲームと同じ得点計算ロジックで答え合わせを行います。
- 同じドロップダウンで「ゲーム」を再度選ぶと通常プレイへ戻ります。
- 各問題ではロンかツモかも表示され、毎回ランダムに決定されます。

### 点数計算クイズモード

- モードを「点数クイズ」に切り替えると、翻数と符数を基に最終得点を当てるクイズが遊べます。
- 解答時には正解の点数に加え、何翻何符かも表示されます。

### 向聴数クイズモード

- モードを「向聴数クイズ」に切り替えると、ランダムな手牌の向聴数を当てるクイズが遊べます。
- デバッグ用途としても利用でき、現在の実装で計算された向聴数とその根拠を確認できます。


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

## ヘルプモーダル（役一覧）

スコアボード右側の「?」ボタンをクリックすると、標準的な役一覧をすべて確認できるモーダルが開きます。各役の門前/副露ごとの翻数と簡単な説明を表形式で表示します。閉じる場合はモーダル右上の「×」を押してください。

---

## Rules Supported

現在実装されているルールは以下の通りです。

- リーチ (Reach)
- ドラ (Dora)

## Not Yet Implemented

以下のルールはまだ実装されていません。

- 本場 (Honba)
- 裏ドラ (Ura Dora)
- 一発 (Ippatsu)

---

## 開発メモ

- 基本的な役判定と符計算を含む点数計算を実装。より高度なAIは未実装（PR歓迎）
- テスト追加・UI改良も歓迎

---

## ライセンス

MIT
