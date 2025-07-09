import { setIcon, Menu, MenuItem } from 'obsidian';
import type FolderOrderPlugin from '../main';

export class UIManager {
  private plugin: FolderOrderPlugin;
  private sortMenuEl: HTMLElement | null = null;
  private fileExplorerEl: HTMLElement | null = null;
  private isInitialized = false;

  constructor(plugin: FolderOrderPlugin) {
    this.plugin = plugin;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.findFileExplorer();
    if (this.fileExplorerEl) {
      this.attachToFileExplorer();
      this.isInitialized = true;
    }
  }

  private async findFileExplorer(): Promise<void> {
    const fileExplorerLeaf = this.plugin.app.workspace.getLeavesOfType('file-explorer')[0];
    if (fileExplorerLeaf && fileExplorerLeaf.view) {
      this.fileExplorerEl = (fileExplorerLeaf.view as any).containerEl;
    }
  }

  createSortMenu(): void {
    if (!this.fileExplorerEl || this.sortMenuEl) return;

    const settings = this.plugin.settingsManager.getSettings();
    if (!settings.showSortMenu) return;

    this.sortMenuEl = this.fileExplorerEl.createDiv('folder-order-sort-menu');
    this.sortMenuEl.style.cssText = `
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--background-modifier-border);
      background: var(--background-primary);
      gap: 8px;
    `;

    const label = this.sortMenuEl.createSpan('sort-label');
    label.textContent = 'Sort:';
    label.style.cssText = `
      font-size: 13px;
      color: var(--text-normal);
      font-weight: 500;
    `;

    const sortButton = this.sortMenuEl.createEl('button', 'sort-button');
    sortButton.style.cssText = `
      background: var(--background-secondary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 13px;
      color: var(--text-normal);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 120px;
      transition: all 0.2s ease;
    `;

    this.updateSortButton(sortButton);

    sortButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSortMenu(sortButton);
    });

    sortButton.addEventListener('mouseenter', () => {
      sortButton.style.background = 'var(--background-modifier-hover)';
    });

    sortButton.addEventListener('mouseleave', () => {
      sortButton.style.background = 'var(--background-secondary)';
    });

    const refreshButton = this.sortMenuEl.createEl('button', 'sort-refresh-btn');
    refreshButton.style.cssText = `
      background: var(--background-secondary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 4px 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    refreshButton.setAttribute('aria-label', 'Refresh folder order');
    
    setIcon(refreshButton, 'refresh-cw');
    
    refreshButton.addEventListener('click', () => {
      this.plugin.refreshFolderOrder();
    });

    refreshButton.addEventListener('mouseenter', () => {
      refreshButton.style.background = 'var(--background-modifier-hover)';
    });

    refreshButton.addEventListener('mouseleave', () => {
      refreshButton.style.background = 'var(--background-secondary)';
    });
  }

  private updateSortButton(button: HTMLButtonElement): void {
    const currentDisplayName = this.plugin.sortService.getCurrentStrategyDisplay();
    button.innerHTML = '';
    
    const textSpan = button.createSpan();
    textSpan.textContent = currentDisplayName;
    
    const iconSpan = button.createSpan();
    iconSpan.style.cssText = `
      margin-left: auto;
      display: flex;
      align-items: center;
    `;
    setIcon(iconSpan, 'chevron-down');
  }

  private showSortMenu(button: HTMLButtonElement): void {
    const menu = new Menu();
    
    const strategies = this.plugin.sortService.getAvailableStrategies();
    const currentStrategy = this.plugin.sortService.getCurrentStrategy();

    strategies.forEach(strategy => {
      menu.addItem((item: MenuItem) => {
        item
          .setTitle(strategy.displayName)
          .setIcon(strategy.name === currentStrategy ? 'check' : '')
          .onClick(() => {
            this.plugin.sortService.setStrategy(strategy.name);
            this.plugin.refreshFolderOrder();
            this.updateSortButton(button);
          });
      });
    });

    menu.showAtMouseEvent(button.getBoundingClientRect() as any);
  }

  updateSortMenu(): void {
    if (!this.sortMenuEl) return;

    const settings = this.plugin.settingsManager.getSettings();
    
    if (!settings.showSortMenu) {
      this.destroySortMenu();
      return;
    }

    const button = this.sortMenuEl.querySelector('.sort-button') as HTMLButtonElement;
    if (button) {
      this.updateSortButton(button);
    }
  }

  destroySortMenu(): void {
    if (this.sortMenuEl) {
      this.sortMenuEl.remove();
      this.sortMenuEl = null;
    }
  }

  attachToFileExplorer(): void {
    if (!this.fileExplorerEl) return;

    const navHeader = this.fileExplorerEl.querySelector('.nav-header');
    if (navHeader) {
      this.createSortMenu();
      if (this.sortMenuEl) {
        navHeader.insertAdjacentElement('afterend', this.sortMenuEl);
      }
    }
  }

  detachFromFileExplorer(): void {
    this.destroySortMenu();
  }

  showLoadingState(): void {
    if (!this.sortMenuEl) return;

    const button = this.sortMenuEl.querySelector('.sort-button') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.style.opacity = '0.5';
    }

    const refreshButton = this.sortMenuEl.querySelector('.sort-refresh-btn') as HTMLButtonElement;
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.style.opacity = '0.5';
    }
  }

  hideLoadingState(): void {
    if (!this.sortMenuEl) return;

    const button = this.sortMenuEl.querySelector('.sort-button') as HTMLButtonElement;
    if (button) {
      button.disabled = false;
      button.style.opacity = '1';
    }

    const refreshButton = this.sortMenuEl.querySelector('.sort-refresh-btn') as HTMLButtonElement;
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.style.opacity = '1';
    }
  }

  showError(message: string): void {
    const notice = this.plugin.app.workspace.containerEl.createDiv('notice');
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--background-modifier-error);
      color: var(--text-error);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      max-width: 300px;
    `;
    notice.textContent = message;

    setTimeout(() => {
      notice.remove();
    }, 3000);
  }

  cleanup(): void {
    this.detachFromFileExplorer();
    this.isInitialized = false;
  }
}