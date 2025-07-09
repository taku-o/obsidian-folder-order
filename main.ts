import { Plugin, TFolder, WorkspaceLeaf } from 'obsidian';
import { SettingsManager } from './src/settings-manager';
import { FolderSortService } from './src/folder-sort-service';
import { UIManager } from './src/ui-manager';
import { FolderOrderSettings } from './src/types';

export default class FolderOrderPlugin extends Plugin {
  public settingsManager!: SettingsManager;
  public sortService!: FolderSortService;
  public uiManager!: UIManager;
  
  private isRefreshing = false;
  private refreshDebounceTimer: NodeJS.Timeout | null = null;

  async onload(): Promise<void> {
    console.log('Loading Folder Order Plugin...');

    this.initializeServices();
    await this.loadSettings();
    await this.initializeUI();
    this.registerEventListeners();
    this.addSettingTab(this.settingsManager.createSettingsTab());

    console.log('Folder Order Plugin loaded successfully');
  }

  onunload(): void {
    console.log('Unloading Folder Order Plugin...');
    
    this.uiManager.cleanup();
    this.clearRefreshTimer();
    
    console.log('Folder Order Plugin unloaded');
  }

  private initializeServices(): void {
    this.settingsManager = new SettingsManager(this);
    this.sortService = new FolderSortService(this.app);
    this.uiManager = new UIManager(this);
  }

  private async loadSettings(): Promise<void> {
    const settings = await this.settingsManager.loadSettings();
    
    this.sortService.setStrategy(settings.defaultSortStrategy);
    
    if (settings.rememberLastUsed) {
      const lastUsed = await this.loadData();
      if (lastUsed && lastUsed.lastUsedStrategy) {
        this.sortService.setStrategy(lastUsed.lastUsedStrategy);
      }
    }
  }

  private async initializeUI(): Promise<void> {
    this.app.workspace.onLayoutReady(() => {
      this.uiManager.initialize();
    });

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.uiManager.initialize();
      })
    );
  }

  private registerEventListeners(): void {
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (file instanceof TFolder) {
          this.debouncedRefresh();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on('delete', (file) => {
        if (file instanceof TFolder) {
          this.debouncedRefresh();
        }
      })
    );

    this.registerEvent(
      this.app.vault.on('rename', (file) => {
        if (file instanceof TFolder) {
          this.debouncedRefresh();
        }
      })
    );

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.uiManager.initialize();
      })
    );
  }

  private debouncedRefresh(): void {
    if (this.refreshDebounceTimer) {
      clearTimeout(this.refreshDebounceTimer);
    }
    
    this.refreshDebounceTimer = setTimeout(() => {
      this.refreshFolderOrder();
    }, 300);
  }

  private clearRefreshTimer(): void {
    if (this.refreshDebounceTimer) {
      clearTimeout(this.refreshDebounceTimer);
      this.refreshDebounceTimer = null;
    }
  }

  public async refreshFolderOrder(): Promise<void> {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    this.uiManager.showLoadingState();

    try {
      const settings = this.settingsManager.getSettings();
      const folders = this.getAllFolders();
      
      if (folders.length === 0) {
        return;
      }

      const sortedFolders = await this.sortService.sortFoldersAsync(folders, settings);
      await this.applyFolderOrder(sortedFolders);
      
      if (settings.rememberLastUsed) {
        await this.saveData({
          ...await this.loadData(),
          lastUsedStrategy: this.sortService.getCurrentStrategy()
        });
      }

    } catch (error) {
      console.error('Failed to refresh folder order:', error);
      this.uiManager.showError('Failed to sort folders. Please try again.');
    } finally {
      this.isRefreshing = false;
      this.uiManager.hideLoadingState();
    }
  }

  private getAllFolders(): TFolder[] {
    return this.app.vault.getAllLoadedFiles()
      .filter(file => file instanceof TFolder) as TFolder[];
  }

  private async applyFolderOrder(sortedFolders: TFolder[]): Promise<void> {
    const fileExplorerLeaf = this.app.workspace.getLeavesOfType('file-explorer')[0];
    if (!fileExplorerLeaf) return;

    const fileExplorerView = fileExplorerLeaf.view as any;
    if (!fileExplorerView || !fileExplorerView.tree) return;

    try {
      const tree = fileExplorerView.tree;
      const rootChildren = tree.children || [];
      
      const folderElements = new Map<string, any>();
      this.collectFolderElements(rootChildren, folderElements);

      const sortedElements: any[] = [];
      for (const folder of sortedFolders) {
        const element = folderElements.get(folder.path);
        if (element) {
          sortedElements.push(element);
        }
      }

      if (sortedElements.length > 0) {
        const parent = sortedElements[0].parentElement;
        if (parent) {
          sortedElements.forEach(element => {
            parent.appendChild(element);
          });
        }
      }

      if (fileExplorerView.requestUpdateTree) {
        fileExplorerView.requestUpdateTree();
      }

    } catch (error) {
      console.error('Failed to apply folder order:', error);
    }
  }

  private collectFolderElements(children: any[], folderElements: Map<string, any>): void {
    for (const child of children) {
      if (child.file instanceof TFolder) {
        folderElements.set(child.file.path, child);
      }
      
      if (child.children && child.children.length > 0) {
        this.collectFolderElements(child.children, folderElements);
      }
    }
  }

  public async saveSettings(newSettings?: Partial<FolderOrderSettings>): Promise<void> {
    await this.settingsManager.saveSettings(newSettings);
  }

  public getSettings(): FolderOrderSettings {
    return this.settingsManager.getSettings();
  }
}