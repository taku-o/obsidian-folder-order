import { setIcon } from 'obsidian';
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
      padding: 4px 8px;
      border-bottom: 1px solid var(--background-modifier-border);
      background: var(--background-primary);
      gap: 8px;
    `;

    const label = this.sortMenuEl.createSpan('sort-label');
    label.textContent = 'Sort:';
    label.style.cssText = `
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    `;

    const dropdown = this.sortMenuEl.createEl('select', 'sort-dropdown');
    dropdown.style.cssText = `
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 12px;
      color: var(--text-normal);
      cursor: pointer;
      min-width: 120px;
    `;

    this.populateDropdown(dropdown);

    dropdown.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.plugin.sortService.setStrategy(target.value);
      this.plugin.refreshFolderOrder();
    });

    const refreshButton = this.sortMenuEl.createEl('button', 'sort-refresh-btn');
    refreshButton.style.cssText = `
      background: transparent;
      border: none;
      padding: 2px 4px;
      cursor: pointer;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
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
      refreshButton.style.background = 'transparent';
    });
  }

  private populateDropdown(dropdown: HTMLSelectElement): void {
    dropdown.innerHTML = '';
    
    const strategies = this.plugin.sortService.getAvailableStrategies();
    const currentStrategy = this.plugin.sortService.getCurrentStrategy();

    strategies.forEach(strategy => {
      const option = dropdown.createEl('option');
      option.value = strategy.name;
      option.textContent = strategy.displayName;
      if (strategy.name === currentStrategy) {
        option.selected = true;
      }
    });
  }

  updateSortMenu(): void {
    if (!this.sortMenuEl) return;

    const settings = this.plugin.settingsManager.getSettings();
    
    if (!settings.showSortMenu) {
      this.destroySortMenu();
      return;
    }

    const dropdown = this.sortMenuEl.querySelector('.sort-dropdown') as HTMLSelectElement;
    if (dropdown) {
      this.populateDropdown(dropdown);
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

    const dropdown = this.sortMenuEl.querySelector('.sort-dropdown') as HTMLSelectElement;
    if (dropdown) {
      dropdown.disabled = true;
      dropdown.style.opacity = '0.5';
    }

    const refreshButton = this.sortMenuEl.querySelector('.sort-refresh-btn') as HTMLButtonElement;
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.style.opacity = '0.5';
    }
  }

  hideLoadingState(): void {
    if (!this.sortMenuEl) return;

    const dropdown = this.sortMenuEl.querySelector('.sort-dropdown') as HTMLSelectElement;
    if (dropdown) {
      dropdown.disabled = false;
      dropdown.style.opacity = '1';
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