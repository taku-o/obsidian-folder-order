# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、Obsidianのファイルエクスプローラーでフォルダの表示順序を制御するObsidian Community Pluginです。ファイルビューアーの上にメニューを追加し、フォルダ名（アルファベット順/逆順）、更新日（新しい順/古い順）、作成日（新しい順/古い順）による並べ替えを可能にします。

## 開発環境セットアップ

### 初期セットアップ（プロジェクトは初期段階）

```bash
# 必要なファイルとディレクトリを作成
npm init -y
npm install -D obsidian typescript @types/node esbuild tslib
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D builtin-modules
```

### 開発用コマンド

```bash
# 開発モード（ホットリロード）
npm run dev

# 本番用ビルド
npm run build

# TypeScript型チェック
tsc -noEmit -skipLibCheck

# リント実行
eslint . --ext ts
```

## プロジェクト構造

```
obsidian-folder-order/
├── .claude/                    # Claude Code設定
├── rules/                      # プロジェクト仕様書
│   └── 001_about.mdc          # プラグイン仕様
├── main.ts                     # メインプラグインファイル（作成予定）
├── manifest.json               # プラグインメタデータ（作成予定）
├── package.json                # 依存関係とスクリプト（作成予定）
├── tsconfig.json               # TypeScript設定（作成予定）
├── esbuild.config.mjs          # ビルド設定（作成予定）
└── styles.css                  # プラグインスタイル（作成予定）
```

## 実装アーキテクチャ

### コアクラス設計

- **FolderOrderPlugin**: メインプラグインクラス（`Plugin`を継承）
- **FolderSortingService**: フォルダ並べ替えロジックを管理
- **SortingOptionsUI**: 並べ替えメニューのUI管理
- **SortingStrategy**: 各並べ替え方式の実装（Strategy パターン）

### 並べ替え方式

実装が必要な並べ替え方式：
1. フォルダ名（アルファベット順）
2. フォルダ名（アルファベット逆順）
3. 更新日（新しい順）
4. 更新日（古い順）
5. 作成日（新しい順）
6. 作成日（古い順）

### Obsidian API 統合

- `WorkspaceLeaf` - ファイルビューアーへのアクセス
- `TFile` と `TFolder` - ファイルとフォルダの操作
- `Plugin` - プラグインライフサイクル管理
- `Setting` - 設定画面（必要に応じて）

## 必要なファイル作成

### 1. manifest.json

```json
{
  "id": "obsidian-folder-order",
  "name": "Folder Order Controller",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "Control folder display order in Obsidian's file explorer",
  "author": "Your Name",
  "isDesktopOnly": false
}
```

### 2. tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["DOM", "ES6"]
  },
  "include": ["**/*.ts"]
}
```

### 3. esbuild.config.mjs

```javascript
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

esbuild.build({
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  watch: !prod,
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
}).catch(() => process.exit(1));
```

## 開発のベストプラクティス

### TypeScript 型安全性

- Obsidian API の型定義を活用
- 厳密な型チェックを維持
- `any` 型の使用を避ける

### パフォーマンス考慮

- 大量のフォルダがある場合の処理効率
- UI 更新時の再描画最適化
- メモリリークの防止

### エラーハンドリング

- Obsidian API 呼び出しの例外処理
- ユーザーフレンドリーなエラーメッセージ
- デバッグ用のコンソールログ

## テスト手法

### 手動テスト

```bash
# 開発用Obsidian vaultでのテスト
# 1. プラグインフォルダにシンボリックリンクを作成
# 2. Obsidianでプラグインを有効化
# 3. フォルダ構造の異なるvaultで動作確認
```

### 動作確認項目

- 各並べ替え方式の正常動作
- フォルダ数が多い場合の性能
- 他のプラグインとの互換性
- モバイル版での動作（必要に応じて）

## リリース手順

1. `manifest.json` のバージョン更新
2. `npm run build` で本番用ビルド
3. GitHub Release 作成
4. `manifest.json`, `main.js`, `styles.css` をリリースに添付
5. コミュニティプラグインストア申請（必要に応じて）