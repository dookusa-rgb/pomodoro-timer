# 簡易ポモドーロ・タスクタイマー

開発ワークショップ用に作成した、ブラウザ完結型のポモドーロタイマーです。タスクごとに完了ポモドーロ数を記録できます。

## 技術スタック

| 項目 | 採用技術 |
|---|---|
| ビルドツール | Vite（`vanilla-ts` テンプレート、UIフレームワークは未使用） |
| スタイリング | Tailwind CSS（`@tailwindcss/vite` プラグイン） |
| バリデーション | Zod |
| パッケージ管理 | pnpm |
| データ保存 | ブラウザの LocalStorage のみ（バックエンドなし） |
| デプロイ先（予定） | Cloudflare Pages |

## 機能

- **タイマー**: 作業（既定25分）/ 小休憩（既定5分）/ 長休憩（既定15分）を自動で切り替え。開始・一時停止・リセット・スキップ操作に対応。
- **タスク管理**: タスク名・見積もりポモドーロ数を指定して追加、選択、削除。選択中のタスクは作業ポモドーロ完了時に完了数が自動で加算される。
- **設定**: 作業時間・小休憩時間・長休憩時間・長休憩までのサイクル数をカスタマイズ可能（Zodでバリデーション）。
- **通知音**: タイマー終了時に Web Audio API で生成した効果音を再生（外部音声ファイル不使用）。
- **今日の統計**: 今日完了したポモドーロ数を表示。日付が変わると自動でリセットされる。
- **永続化**: タスク・設定・今日の統計を LocalStorage に保存し、リロードしても復元。保存データは Zod の `safeParse` で検証し、壊れていた場合はデフォルト値にフォールバックする。

## セットアップ

```bash
pnpm install
pnpm dev       # 開発サーバー起動
pnpm run build # 本番ビルド（dist/ に出力）
pnpm preview   # ビルド結果のプレビュー
```

## ディレクトリ構成

```
src/
├── main.ts                 # エントリーポイント、画面全体の組み立て
├── styles.css               # Tailwindエントリー
├── types/schema.ts          # Zodスキーマ・型定義（Task/Settings/TodayStats/AppState）
├── store/appStore.ts        # 中央state保持＋Pub/Sub
├── storage/localStorage.ts  # LocalStorage読み書き（保存キー: pomodoro-app-state-v1）
├── timer/
│   ├── timerEngine.ts       # タイマーの状態機械（時刻ベースで高精度に計測）
│   └── timerTypes.ts
├── tasks/taskActions.ts     # タスクCRUD
├── stats/todayStats.ts      # 今日の完了数管理（日付ロールオーバー）
├── sound/playSound.ts       # 完了時の効果音（Web Audio API）
└── ui/                      # 各画面のDOM生成・更新（renderTimer / renderTaskList / renderSettings / renderStats / components）
```

**設計方針**: UIフレームワークを使わないため、「状態（store）」「ロジック（timer/tasks/stats）」「描画（ui配下のrender関数）」を分離。`appStore` が唯一の状態保持場所となり、変更はリスナー経由で各render関数に伝播する。タイマーの残り時間は `setInterval` の単純カウントダウンではなく、終了予定時刻（`Date.now() + 残りms`）からの逆算方式にすることで、タブが非アクティブな間の誤差も補正される。

## これまでの作業ログ

1. **設計フェーズ**: 必須機能・Zodバリデーション対象・UI/UXイメージ・実装ステップをユーザーと対話しながら合意（フレームワークなしのVanilla TypeScript、タスク管理あり、通知は効果音のみ、統計は簡易版）。
2. **実装フェーズ**: 上記ディレクトリ構成に沿ってステップバイステップで実装。
3. **動作確認**: Playwright（Chromium headless）でアプリを実際に操作し、以下を確認済み。
   - 画面表示（円形プログレスタイマー・タスクリスト・設定・統計）
   - タスク名を空で追加した際のバリデーションエラー表示
   - タイマーの開始・一時停止・スキップ・リセット操作
   - 設定変更の保存
   - 1分間タイマーを実際に完走させ、モードが作業→小休憩に遷移し、選択中タスクの完了数と今日の統計が正しく連動して加算されることを確認
   - コンソールエラーなし、`pnpm run build` も成功

## 未着手・今後の作業

- **Cloudflare Pagesへのデプロイ**（ユーザーの判断で保留中）。ビルドコマンドは `pnpm install && pnpm run build`、出力ディレクトリは `dist` を想定。
- 機能拡張の候補（未依頼・未実装）: タスクの編集機能、日別履歴の一覧・グラフ表示、ブラウザ通知（Notification API）対応など。
