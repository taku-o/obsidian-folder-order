# 技術仕様書 - Obsidian Folder Order Plugin

## 1. システム概要

### 1.1 アーキテクチャ
```
┌─────────────────────────────────────────────────────────────┐
│                      Obsidian Core                         │
├─────────────────────────────────────────────────────────────┤
│                 Folder Order Plugin                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  UI Components  │  │  Sort Service   │  │  Settings       ││
│  │                 │  │                 │  │  Manager        ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                 Obsidian Plugin API                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │    Workspace    │  │     Vault       │  │  MetadataCache  ││
│  │     API         │  │     API         │  │      API        ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック
- **言語**: TypeScript 4.7+
- **フレームワーク**: Obsidian Plugin API
- **ビルドツール**: esbuild
- **テスト**: Jest（モック使用）
- **リント**: ESLint + TypeScript ESLint

## 2. コンポーネント設計

### 2.1 メインプラグインクラス

```typescript
export default class FolderOrderPlugin extends Plugin {
  private settings: FolderOrderSettings;
  private sortService: FolderSortService;
  private uiManager: UIManager;
  private settingsManager: SettingsManager;

  async onload(): Promise<void>
  onunload(): void
  async loadSettings(): Promise<void>
  async saveSettings(): Promise<void>
}
```

### 2.2 フォルダソートサービス

```typescript
interface SortStrategy {
  sort(folders: TFolder[]): TFolder[];
  getName(): string;
  getDisplayName(): string;
}

class FolderSortService {
  private strategies: Map<string, SortStrategy>;
  private currentStrategy: string;

  registerStrategy(name: string, strategy: SortStrategy): void
  setStrategy(name: string): void
  sortFolders(folders: TFolder[]): TFolder[]
  getAvailableStrategies(): string[]
}
```

### 2.3 ソート戦略（Strategy Pattern）

```typescript
class AlphabeticalAscStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
  }
}

class AlphabeticalDescStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      b.name.localeCompare(a.name, undefined, { numeric: true })
    );
  }
}

class ModifiedDateAscStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      this.getLatestModifiedDate(a) - this.getLatestModifiedDate(b)
    );
  }
}

class ModifiedDateDescStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      this.getLatestModifiedDate(b) - this.getLatestModifiedDate(a)
    );
  }
}

class CreatedDateAscStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      this.getEarliestCreatedDate(a) - this.getEarliestCreatedDate(b)
    );
  }
}

class CreatedDateDescStrategy implements SortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return folders.sort((a, b) => 
      this.getEarliestCreatedDate(b) - this.getEarliestCreatedDate(a)
    );
  }
}
```

### 2.4 UI管理クラス

```typescript
class UIManager {
  private plugin: FolderOrderPlugin;
  private sortMenuEl: HTMLElement;
  private fileExplorerEl: HTMLElement;

  constructor(plugin: FolderOrderPlugin)
  createSortMenu(): void
  updateSortMenu(): void
  destroySortMenu(): void
  attachToFileExplorer(): void
  detachFromFileExplorer(): void
}
```

### 2.5 設定管理クラス

```typescript
interface FolderOrderSettings {
  defaultSortStrategy: string;
  rememberLastUsed: boolean;
  showSortMenu: boolean;
  excludeSystemFolders: boolean;
  excludePatterns: string[];
  customSortOrder: Record<string, number>;
}

class SettingsManager {
  private plugin: FolderOrderPlugin;
  private settings: FolderOrderSettings;

  constructor(plugin: FolderOrderPlugin)
  loadSettings(): Promise<FolderOrderSettings>
  saveSettings(settings: FolderOrderSettings): Promise<void>
  getDefaultSettings(): FolderOrderSettings
  createSettingsTab(): void
}
```

## 3. データ構造

### 3.1 フォルダ情報

```typescript
interface FolderInfo {
  folder: TFolder;
  name: string;
  path: string;
  createdDate: number;
  modifiedDate: number;
  childrenCount: number;
  depth: number;
}
```

### 3.2 ソート設定

```typescript
interface SortConfig {
  strategy: string;
  direction: 'asc' | 'desc';
  customOrder?: string[];
  excludePatterns?: string[];
}
```

### 3.3 イベント定義

```typescript
interface FolderOrderEvents {
  'sort-changed': (strategy: string) => void;
  'folders-reordered': (folders: TFolder[]) => void;
  'settings-updated': (settings: FolderOrderSettings) => void;
}
```

## 4. API統合

### 4.1 Obsidian API使用方法

```typescript
// Workspace API
const fileExplorer = this.app.workspace.getLeavesOfType('file-explorer')[0];
const fileExplorerView = fileExplorer.view as FileExplorerView;

// Vault API
const folders = this.app.vault.getAllLoadedFiles()
  .filter(file => file instanceof TFolder) as TFolder[];

// MetadataCache API
const fileStats = this.app.vault.adapter.stat(folder.path);
```

### 4.2 イベントハンドリング

```typescript
// ファイルシステムイベント
this.registerEvent(
  this.app.vault.on('create', (file) => {
    if (file instanceof TFolder) {
      this.refreshFolderOrder();
    }
  })
);

this.registerEvent(
  this.app.vault.on('delete', (file) => {
    if (file instanceof TFolder) {
      this.refreshFolderOrder();
    }
  })
);

this.registerEvent(
  this.app.vault.on('rename', (file, oldPath) => {
    if (file instanceof TFolder) {
      this.refreshFolderOrder();
    }
  })
);
```

## 5. パフォーマンス最適化

### 5.1 非同期処理

```typescript
class AsyncFolderSortService {
  private sortQueue: Promise<void> = Promise.resolve();

  async sortFoldersAsync(folders: TFolder[]): Promise<TFolder[]> {
    this.sortQueue = this.sortQueue.then(async () => {
      return new Promise((resolve) => {
        // バックグラウンドでソート処理
        setTimeout(() => {
          const sorted = this.currentStrategy.sort(folders);
          resolve(sorted);
        }, 0);
      });
    });
    return this.sortQueue;
  }
}
```

### 5.2 メモ化とキャッシュ

```typescript
class CachedFolderSortService {
  private cache: Map<string, TFolder[]> = new Map();
  private cacheTimeout: number = 5000; // 5秒

  sortFolders(folders: TFolder[]): TFolder[] {
    const cacheKey = this.generateCacheKey(folders);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const sorted = this.currentStrategy.sort(folders);
    this.cache.set(cacheKey, sorted);
    
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.cacheTimeout);

    return sorted;
  }
}
```

### 5.3 仮想化（大量フォルダ対応）

```typescript
class VirtualizedFolderList {
  private visibleRange: { start: number; end: number };
  private itemHeight: number = 24;
  private containerHeight: number;

  updateVisibleRange(scrollTop: number): void {
    const start = Math.floor(scrollTop / this.itemHeight);
    const end = start + Math.ceil(this.containerHeight / this.itemHeight);
    this.visibleRange = { start, end };
  }

  renderVisibleItems(folders: TFolder[]): HTMLElement[] {
    return folders
      .slice(this.visibleRange.start, this.visibleRange.end)
      .map(folder => this.renderFolderItem(folder));
  }
}
```

## 6. エラーハンドリング

### 6.1 エラー種別定義

```typescript
enum FolderOrderError {
  INVALID_FOLDER_STRUCTURE = 'INVALID_FOLDER_STRUCTURE',
  SORT_STRATEGY_NOT_FOUND = 'SORT_STRATEGY_NOT_FOUND',
  SETTINGS_LOAD_FAILED = 'SETTINGS_LOAD_FAILED',
  UI_ATTACHMENT_FAILED = 'UI_ATTACHMENT_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

class FolderOrderException extends Error {
  constructor(
    public code: FolderOrderError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FolderOrderException';
  }
}
```

### 6.2 エラーハンドリング戦略

```typescript
class ErrorHandler {
  private plugin: FolderOrderPlugin;
  private logger: Logger;

  handleError(error: Error, context: string): void {
    this.logger.error(`[${context}] ${error.message}`, error);
    
    if (error instanceof FolderOrderException) {
      this.handlePluginError(error);
    } else {
      this.handleGenericError(error, context);
    }
  }

  private handlePluginError(error: FolderOrderException): void {
    switch (error.code) {
      case FolderOrderError.SORT_STRATEGY_NOT_FOUND:
        this.plugin.settings.defaultSortStrategy = 'alphabetical-asc';
        break;
      case FolderOrderError.SETTINGS_LOAD_FAILED:
        this.plugin.settings = this.plugin.settingsManager.getDefaultSettings();
        break;
      default:
        this.showErrorNotice(error.message);
    }
  }
}
```

## 7. テスト戦略

### 7.1 単体テスト

```typescript
describe('FolderSortService', () => {
  let sortService: FolderSortService;
  let mockFolders: TFolder[];

  beforeEach(() => {
    sortService = new FolderSortService();
    mockFolders = createMockFolders();
  });

  describe('sortFolders', () => {
    it('should sort folders alphabetically ascending', () => {
      sortService.setStrategy('alphabetical-asc');
      const sorted = sortService.sortFolders(mockFolders);
      
      expect(sorted[0].name).toBe('Folder A');
      expect(sorted[1].name).toBe('Folder B');
    });

    it('should sort folders by modified date descending', () => {
      sortService.setStrategy('modified-desc');
      const sorted = sortService.sortFolders(mockFolders);
      
      expect(sorted[0].name).toBe('Recently Modified');
      expect(sorted[1].name).toBe('Older Modified');
    });
  });
});
```

### 7.2 統合テスト

```typescript
describe('FolderOrderPlugin Integration', () => {
  let plugin: FolderOrderPlugin;
  let mockApp: App;

  beforeEach(async () => {
    mockApp = createMockApp();
    plugin = new FolderOrderPlugin(mockApp, createMockManifest());
    await plugin.onload();
  });

  afterEach(() => {
    plugin.onunload();
  });

  it('should initialize all components correctly', () => {
    expect(plugin.sortService).toBeDefined();
    expect(plugin.uiManager).toBeDefined();
    expect(plugin.settingsManager).toBeDefined();
  });
});
```

## 8. セキュリティ考慮事項

### 8.1 入力検証

```typescript
class InputValidator {
  static validateFolderName(name: string): boolean {
    const invalidChars = /[<>:"/\\|?*]/;
    return !invalidChars.test(name);
  }

  static validateSortStrategy(strategy: string): boolean {
    const validStrategies = [
      'alphabetical-asc', 'alphabetical-desc',
      'modified-asc', 'modified-desc',
      'created-asc', 'created-desc'
    ];
    return validStrategies.includes(strategy);
  }
}
```

### 8.2 権限管理

```typescript
class PermissionManager {
  private plugin: FolderOrderPlugin;

  canAccessFolder(folder: TFolder): boolean {
    // システムフォルダの除外
    if (folder.path.startsWith('.obsidian')) {
      return false;
    }
    
    // ユーザー定義の除外パターン
    const excludePatterns = this.plugin.settings.excludePatterns;
    return !excludePatterns.some(pattern => 
      new RegExp(pattern).test(folder.path)
    );
  }
}
```

## 9. 配布とメンテナンス

### 9.1 ビルド設定

```javascript
// esbuild.config.mjs
import esbuild from "esbuild";

const production = process.argv.includes('--production');

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: production ? false : 'inline',
  treeShaking: true,
  minify: production,
  outfile: 'main.js',
  define: {
    'process.env.NODE_ENV': production ? '"production"' : '"development"'
  }
});
```

### 9.2 リリース管理

```json
{
  "scripts": {
    "build": "tsc --noEmit --skipLibCheck && node esbuild.config.mjs --production",
    "dev": "node esbuild.config.mjs",
    "test": "jest",
    "lint": "eslint src --ext ts",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  }
}
```

### 9.3 CI/CD設定

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - '*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: softprops/action-gh-release@v1
        with:
          files: |
            main.js
            manifest.json
            styles.css
```

## 10. 監視と診断

### 10.1 ログ管理

```typescript
class Logger {
  private prefix: string = '[FolderOrder]';
  private logLevel: LogLevel = LogLevel.INFO;

  debug(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`${this.prefix} ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`${this.prefix} ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ${message}`, ...args);
  }
}
```

### 10.2 パフォーマンス監視

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  measureTime<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.metrics.set(operation, duration);
    
    if (duration > 100) { // 100ms以上の場合は警告
      console.warn(`Slow operation: ${operation} took ${duration}ms`);
    }
    
    return result;
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```