import { TFolder, App } from 'obsidian';
import { 
  SortStrategy, 
  AlphabeticalAscStrategy, 
  AlphabeticalDescStrategy,
  ModifiedDateAscStrategy,
  ModifiedDateDescStrategy,
  CreatedDateAscStrategy,
  CreatedDateDescStrategy
} from './sort-strategies';
import { FolderOrderSettings } from './types';

export class FolderSortService {
  private app: App;
  private strategies: Map<string, SortStrategy>;
  private currentStrategy: string;
  private cache: Map<string, TFolder[]>;
  private cacheTimeout: number = 5000;

  constructor(app: App) {
    this.app = app;
    this.strategies = new Map();
    this.currentStrategy = 'alphabetical-asc';
    this.cache = new Map();
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    const strategies = [
      new AlphabeticalAscStrategy(this.app),
      new AlphabeticalDescStrategy(this.app),
      new ModifiedDateAscStrategy(this.app),
      new ModifiedDateDescStrategy(this.app),
      new CreatedDateAscStrategy(this.app),
      new CreatedDateDescStrategy(this.app)
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.getName(), strategy);
    });
  }

  registerStrategy(name: string, strategy: SortStrategy): void {
    this.strategies.set(name, strategy);
  }

  setStrategy(name: string): boolean {
    if (this.strategies.has(name)) {
      this.currentStrategy = name;
      this.clearCache();
      return true;
    }
    return false;
  }

  getCurrentStrategy(): string {
    return this.currentStrategy;
  }

  getCurrentStrategyDisplay(): string {
    const strategy = this.strategies.get(this.currentStrategy);
    return strategy ? strategy.getDisplayName() : 'Unknown';
  }

  sortFolders(folders: TFolder[], settings: FolderOrderSettings): TFolder[] {
    const filtered = this.filterFolders(folders, settings);
    const cacheKey = this.generateCacheKey(filtered, this.currentStrategy);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) {
      console.warn(`Sort strategy '${this.currentStrategy}' not found, using default`);
      this.currentStrategy = 'alphabetical-asc';
      return this.sortFolders(folders, settings);
    }

    const sorted = strategy.sort(filtered);
    this.cache.set(cacheKey, sorted);
    
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.cacheTimeout);

    return sorted;
  }

  private filterFolders(folders: TFolder[], settings: FolderOrderSettings): TFolder[] {
    return folders.filter(folder => {
      if (settings.excludeSystemFolders && this.isSystemFolder(folder)) {
        return false;
      }

      if (settings.excludePatterns.length > 0) {
        for (const pattern of settings.excludePatterns) {
          try {
            const regex = new RegExp(pattern);
            if (regex.test(folder.name) || regex.test(folder.path)) {
              return false;
            }
          } catch (error) {
            console.warn(`Invalid regex pattern: ${pattern}`, error);
          }
        }
      }

      return true;
    });
  }

  private isSystemFolder(folder: TFolder): boolean {
    const systemFolders = ['.obsidian', '.trash', '.git'];
    return systemFolders.some(sysFolder => 
      folder.path.startsWith(sysFolder) || folder.name.startsWith('.')
    );
  }

  getAvailableStrategies(): Array<{ name: string; displayName: string }> {
    return Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.getName(),
      displayName: strategy.getDisplayName()
    }));
  }

  private generateCacheKey(folders: TFolder[], strategy: string): string {
    const folderPaths = folders.map(f => f.path).sort().join(',');
    return `${strategy}:${folderPaths}`;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  async sortFoldersAsync(folders: TFolder[], settings: FolderOrderSettings): Promise<TFolder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.sortFolders(folders, settings);
        resolve(result);
      }, 0);
    });
  }
}