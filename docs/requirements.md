# 要件仕様書 - Obsidian Folder Order Plugin

## 1. プロジェクト概要

### 1.1 目的
Obsidianのファイルエクスプローラーにおけるフォルダの表示順序を制御可能にするCommunity Pluginの開発

### 1.2 対象ユーザー
- Obsidianを使用してナレッジマネジメントを行うユーザー
- フォルダ構成を重視した情報整理を行うユーザー
- 大量のフォルダを効率的に管理したいユーザー

### 1.3 背景
- Obsidianのデフォルトフォルダ表示は固定的で、ユーザーが望む順序に変更できない
- プロジェクト管理や学習ノートにおいて、フォルダの表示順序が重要な場合がある
- 既存のファイル管理プラグインは複雑で、シンプルなソート機能に特化したものが不足

## 2. 機能要件

### 2.1 基本機能

#### 2.1.1 ソートメニューの表示
- **要件**: ファイルエクスプローラーの上部にソートメニューを表示
- **仕様**: 
  - ドロップダウンメニューまたはボタン群での選択UI
  - 現在選択中のソート方式を視覚的に表示
  - デフォルトではObsidianの標準表示順序

#### 2.1.2 フォルダ名によるソート
- **フォルダ名（アルファベット順）**: A-Z順での表示
- **フォルダ名（アルファベット逆順）**: Z-A順での表示
- **仕様**:
  - 日本語フォルダ名も適切にソート（読み方ベース）
  - 特殊文字や数字を含むフォルダ名の適切な処理
  - 大文字小文字を区別しない自然順ソート

#### 2.1.3 日付によるソート
- **更新日（新しい順）**: 最終更新日時の降順
- **更新日（古い順）**: 最終更新日時の昇順
- **作成日（新しい順）**: 作成日時の降順
- **作成日（古い順）**: 作成日時の昇順
- **仕様**:
  - フォルダ内のファイルの更新日時を基準とした判定
  - 空フォルダの日付処理方法
  - 日付が同じ場合のセカンダリソート（フォルダ名）

### 2.2 高度な機能

#### 2.2.1 カスタムソート順
- **要件**: ユーザー定義のフォルダ表示順序
- **仕様**:
  - ドラッグ&ドロップによる順序変更
  - 設定の永続化
  - 新規フォルダの自動配置ルール

#### 2.2.2 階層別ソート
- **要件**: 階層レベルごとに異なるソート方式を適用
- **仕様**:
  - ルートレベル、サブフォルダレベルごとの設定
  - 階層深度に応じた設定継承

#### 2.2.3 条件付きソート
- **要件**: フォルダ名のプレフィックスやパターンによる条件分け
- **仕様**:
  - 正規表現による条件設定
  - 条件に合致するフォルダのグループ化
  - 条件別の表示スタイル

### 2.3 設定機能

#### 2.3.1 プラグイン設定
- **デフォルトソート方式**: 起動時の初期ソート設定
- **ソート方式の保存**: 最後に選択したソート方式の記憶
- **表示設定**: メニューの表示/非表示切り替え

#### 2.3.2 除外設定
- **システムフォルダ除外**: .obsidian等の特殊フォルダの除外
- **パターン除外**: 特定パターンのフォルダ名を除外
- **手動除外**: 個別フォルダの除外設定

## 3. 非機能要件

### 3.1 性能要件
- **応答時間**: ソート実行は1秒以内
- **メモリ使用量**: 追加メモリ使用量は10MB以内
- **大規模対応**: 1000個以上のフォルダでも正常動作

### 3.2 互換性要件
- **Obsidianバージョン**: v0.15.0以降に対応
- **プラットフォーム**: デスクトップ版（Windows, macOS, Linux）
- **モバイル対応**: iOS/Android版での基本機能提供

### 3.3 可用性要件
- **エラー処理**: 不正なフォルダ構造での堅牢性
- **リカバリ**: 設定破損時の自動復旧
- **ログ**: デバッグ用の詳細ログ出力

### 3.4 セキュリティ要件
- **データ保護**: ユーザーデータの適切な保護
- **権限管理**: 必要最小限の権限でのファイルアクセス
- **プライバシー**: 外部通信の排除

## 4. 制約事項

### 4.1 技術的制約
- **Obsidian API**: 利用可能なAPIの範囲内での実装
- **プラグイン制限**: サンドボックス環境でのセキュリティ制約
- **パフォーマンス**: UIスレッドをブロックしない非同期処理

### 4.2 ユーザビリティ制約
- **学習コスト**: 既存のObsidianユーザーが容易に理解可能
- **視覚的統合**: Obsidianの標準UIとの一貫性
- **アクセシビリティ**: スクリーンリーダー対応

### 4.3 運用制約
- **メンテナンス**: Obsidianアップデートへの追従
- **サポート**: 英語・日本語でのドキュメント提供
- **配布**: Obsidian Community Plugin Storeでの配布

## 5. 受入基準

### 5.1 基本機能
- [ ] 6種類のソート方式が正常に動作する
- [ ] ソートメニューが適切に表示される
- [ ] 選択したソート方式が保存される
- [ ] 大量のフォルダでもパフォーマンスが維持される

### 5.2 ユーザビリティ
- [ ] 直感的なUI操作が可能
- [ ] Obsidianの標準UIとの統一感
- [ ] エラー時の適切なメッセージ表示
- [ ] 設定の簡単な変更が可能

### 5.3 技術品質
- [ ] TypeScriptでの型安全な実装
- [ ] 適切なエラーハンドリング
- [ ] メモリリークの防止
- [ ] モバイル環境での基本動作

### 5.4 配布準備
- [ ] Community Plugin Store申請要件の充足
- [ ] 英語・日本語のドキュメント整備
- [ ] サンプルvaultでのテスト完了
- [ ] 継続的メンテナンス体制の構築

## 6. 今後の拡張可能性

### 6.1 機能拡張
- ファイルレベルでのソート機能
- フォルダグループ化機能
- ブックマーク機能との連携
- 検索結果での適用

### 6.2 他プラグインとの連携
- File Tree Alternativeとの統合
- Templaterとの連携
- Dataviewとの連携
- Quick Switcherとの連携

### 6.3 高度な機能
- AIによる自動フォルダ分類
- 使用頻度に基づくソート
- 時間帯別の表示切り替え
- チーム機能との連携