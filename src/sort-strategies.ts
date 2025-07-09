import { TFolder, TFile } from 'obsidian';
import { FolderInfo } from './types';

export interface SortStrategy {
  sort(folders: TFolder[]): TFolder[];
  getName(): string;
  getDisplayName(): string;
}

export abstract class BaseSortStrategy implements SortStrategy {
  protected app: any;

  constructor(app: any) {
    this.app = app;
  }

  abstract sort(folders: TFolder[]): TFolder[];
  abstract getName(): string;
  abstract getDisplayName(): string;

  protected async getFolderInfo(folder: TFolder): Promise<FolderInfo> {
    const files = this.app.vault.getFiles();
    const folderFiles = files.filter((file: TFile) => file.path.startsWith(folder.path + '/'));
    
    let latestModified = 0;
    let earliestCreated = Date.now();
    let childrenCount = 0;

    for (const file of folderFiles) {
      const stats = await this.app.vault.adapter.stat(file.path);
      if (stats) {
        latestModified = Math.max(latestModified, stats.mtime);
        earliestCreated = Math.min(earliestCreated, stats.ctime);
        childrenCount++;
      }
    }

    const depth = folder.path.split('/').length;

    return {
      folder,
      name: folder.name,
      path: folder.path,
      createdDate: earliestCreated,
      modifiedDate: latestModified,
      childrenCount,
      depth
    };
  }

  protected async getLatestModifiedDate(folder: TFolder): Promise<number> {
    const info = await this.getFolderInfo(folder);
    return info.modifiedDate;
  }

  protected async getEarliestCreatedDate(folder: TFolder): Promise<number> {
    const info = await this.getFolderInfo(folder);
    return info.createdDate;
  }
}

export class AlphabeticalAscStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      })
    );
  }

  getName(): string {
    return 'alphabetical-asc';
  }

  getDisplayName(): string {
    return 'ファイル名 (アルファベット順)';
  }
}

export class AlphabeticalDescStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => 
      b.name.localeCompare(a.name, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      })
    );
  }

  getName(): string {
    return 'alphabetical-desc';
  }

  getDisplayName(): string {
    return 'ファイル名 (アルファベット逆順)';
  }
}

export class ModifiedDateAscStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => {
      const aTime = this.getFolderModifiedTime(a);
      const bTime = this.getFolderModifiedTime(b);
      return aTime - bTime;
    });
  }

  getName(): string {
    return 'modified-asc';
  }

  getDisplayName(): string {
    return '更新日 (古い順)';
  }

  private getFolderModifiedTime(folder: TFolder): number {
    const files = this.app.vault.getFiles();
    const folderFiles = files.filter((file: TFile) => file.path.startsWith(folder.path + '/'));
    
    let latestTime = 0;
    for (const file of folderFiles) {
      if (file.stat && file.stat.mtime > latestTime) {
        latestTime = file.stat.mtime;
      }
    }
    
    return latestTime;
  }
}

export class ModifiedDateDescStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => {
      const aTime = this.getFolderModifiedTime(a);
      const bTime = this.getFolderModifiedTime(b);
      return bTime - aTime;
    });
  }

  getName(): string {
    return 'modified-desc';
  }

  getDisplayName(): string {
    return '更新日 (新しい順)';
  }

  private getFolderModifiedTime(folder: TFolder): number {
    const files = this.app.vault.getFiles();
    const folderFiles = files.filter((file: TFile) => file.path.startsWith(folder.path + '/'));
    
    let latestTime = 0;
    for (const file of folderFiles) {
      if (file.stat && file.stat.mtime > latestTime) {
        latestTime = file.stat.mtime;
      }
    }
    
    return latestTime;
  }
}

export class CreatedDateAscStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => {
      const aTime = this.getFolderCreatedTime(a);
      const bTime = this.getFolderCreatedTime(b);
      return aTime - bTime;
    });
  }

  getName(): string {
    return 'created-asc';
  }

  getDisplayName(): string {
    return '作成日 (古い順)';
  }

  private getFolderCreatedTime(folder: TFolder): number {
    const files = this.app.vault.getFiles();
    const folderFiles = files.filter((file: TFile) => file.path.startsWith(folder.path + '/'));
    
    let earliestTime = Date.now();
    for (const file of folderFiles) {
      if (file.stat && file.stat.ctime < earliestTime) {
        earliestTime = file.stat.ctime;
      }
    }
    
    return earliestTime;
  }
}

export class CreatedDateDescStrategy extends BaseSortStrategy {
  sort(folders: TFolder[]): TFolder[] {
    return [...folders].sort((a, b) => {
      const aTime = this.getFolderCreatedTime(a);
      const bTime = this.getFolderCreatedTime(b);
      return bTime - aTime;
    });
  }

  getName(): string {
    return 'created-desc';
  }

  getDisplayName(): string {
    return '作成日 (新しい順)';
  }

  private getFolderCreatedTime(folder: TFolder): number {
    const files = this.app.vault.getFiles();
    const folderFiles = files.filter((file: TFile) => file.path.startsWith(folder.path + '/'));
    
    let earliestTime = Date.now();
    for (const file of folderFiles) {
      if (file.stat && file.stat.ctime < earliestTime) {
        earliestTime = file.stat.ctime;
      }
    }
    
    return earliestTime;
  }
}