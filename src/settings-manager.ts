import { App, PluginSettingTab, Setting } from 'obsidian';
import type FolderOrderPlugin from '../main';
import { FolderOrderSettings, DEFAULT_SETTINGS } from './types';

export class SettingsManager {
  private plugin: FolderOrderPlugin;
  private settings: FolderOrderSettings;

  constructor(plugin: FolderOrderPlugin) {
    this.plugin = plugin;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async loadSettings(): Promise<FolderOrderSettings> {
    try {
      const loadedSettings = await this.plugin.loadData();
      if (loadedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...loadedSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
    return this.settings;
  }

  async saveSettings(newSettings?: Partial<FolderOrderSettings>): Promise<void> {
    if (newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }
    try {
      await this.plugin.saveData(this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): FolderOrderSettings {
    return { ...this.settings };
  }

  getDefaultSettings(): FolderOrderSettings {
    return { ...DEFAULT_SETTINGS };
  }

  createSettingsTab(): FolderOrderSettingTab {
    return new FolderOrderSettingTab(this.plugin.app, this.plugin);
  }

  async resetSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.saveSettings();
  }
}

export class FolderOrderSettingTab extends PluginSettingTab {
  plugin: FolderOrderPlugin;

  constructor(app: App, plugin: FolderOrderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Folder Order Settings' });

    this.createGeneralSettings();
    this.createSortSettings();
    this.createAdvancedSettings();
  }

  private createGeneralSettings(): void {
    const { containerEl } = this;
    const settings = this.plugin.settingsManager.getSettings();

    containerEl.createEl('h3', { text: 'General Settings' });

    new Setting(containerEl)
      .setName('Show sort menu')
      .setDesc('Display the sort menu in the file explorer')
      .addToggle(toggle => toggle
        .setValue(settings.showSortMenu)
        .onChange(async (value) => {
          await this.plugin.settingsManager.saveSettings({ showSortMenu: value });
          this.plugin.uiManager.updateSortMenu();
        })
      );

    new Setting(containerEl)
      .setName('Remember last used sort method')
      .setDesc('Remember the last selected sort method when restarting Obsidian')
      .addToggle(toggle => toggle
        .setValue(settings.rememberLastUsed)
        .onChange(async (value) => {
          await this.plugin.settingsManager.saveSettings({ rememberLastUsed: value });
        })
      );
  }

  private createSortSettings(): void {
    const { containerEl } = this;
    const settings = this.plugin.settingsManager.getSettings();

    containerEl.createEl('h3', { text: 'Default Sort Method' });

    new Setting(containerEl)
      .setName('Default sort strategy')
      .setDesc('Choose the default sorting method when the plugin loads')
      .addDropdown(dropdown => dropdown
        .addOption('alphabetical-asc', 'Name (A→Z)')
        .addOption('alphabetical-desc', 'Name (Z→A)')
        .addOption('modified-asc', 'Modified (Oldest)')
        .addOption('modified-desc', 'Modified (Newest)')
        .addOption('created-asc', 'Created (Oldest)')
        .addOption('created-desc', 'Created (Newest)')
        .setValue(settings.defaultSortStrategy)
        .onChange(async (value) => {
          await this.plugin.settingsManager.saveSettings({ defaultSortStrategy: value });
        })
      );
  }

  private createAdvancedSettings(): void {
    const { containerEl } = this;
    const settings = this.plugin.settingsManager.getSettings();

    containerEl.createEl('h3', { text: 'Advanced Settings' });

    new Setting(containerEl)
      .setName('Exclude system folders')
      .setDesc('Exclude system folders like .obsidian, .trash from sorting')
      .addToggle(toggle => toggle
        .setValue(settings.excludeSystemFolders)
        .onChange(async (value) => {
          await this.plugin.settingsManager.saveSettings({ excludeSystemFolders: value });
        })
      );

    new Setting(containerEl)
      .setName('Exclude patterns')
      .setDesc('Regular expressions to exclude folders from sorting (one per line)')
      .addTextArea(textArea => textArea
        .setValue(settings.excludePatterns.join('\n'))
        .onChange(async (value) => {
          const patterns = value.split('\n').filter(pattern => pattern.trim() !== '');
          await this.plugin.settingsManager.saveSettings({ excludePatterns: patterns });
        })
      );

    new Setting(containerEl)
      .setName('Reset settings')
      .setDesc('Reset all settings to default values')
      .addButton(button => button
        .setButtonText('Reset')
        .setCta()
        .onClick(async () => {
          await this.plugin.settingsManager.resetSettings();
          this.display();
        })
      );
  }
}