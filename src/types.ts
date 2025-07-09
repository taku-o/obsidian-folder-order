import { TFolder } from 'obsidian';

export interface FolderOrderSettings {
  defaultSortStrategy: string;
  rememberLastUsed: boolean;
  showSortMenu: boolean;
  excludeSystemFolders: boolean;
  excludePatterns: string[];
  customSortOrder: Record<string, number>;
}

export interface FolderInfo {
  folder: TFolder;
  name: string;
  path: string;
  createdDate: number;
  modifiedDate: number;
  childrenCount: number;
  depth: number;
}

export interface SortConfig {
  strategy: string;
  direction: 'asc' | 'desc';
  customOrder?: string[];
  excludePatterns?: string[];
}

export interface FolderOrderEvents {
  'sort-changed': (strategy: string) => void;
  'folders-reordered': (folders: TFolder[]) => void;
  'settings-updated': (settings: FolderOrderSettings) => void;
}

export enum FolderOrderError {
  INVALID_FOLDER_STRUCTURE = 'INVALID_FOLDER_STRUCTURE',
  SORT_STRATEGY_NOT_FOUND = 'SORT_STRATEGY_NOT_FOUND',
  SETTINGS_LOAD_FAILED = 'SETTINGS_LOAD_FAILED',
  UI_ATTACHMENT_FAILED = 'UI_ATTACHMENT_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export class FolderOrderException extends Error {
  constructor(
    public code: FolderOrderError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FolderOrderException';
  }
}

export type SortStrategy = 'alphabetical-asc' | 'alphabetical-desc' | 'modified-asc' | 'modified-desc' | 'created-asc' | 'created-desc';

export const DEFAULT_SETTINGS: FolderOrderSettings = {
  defaultSortStrategy: 'alphabetical-asc',
  rememberLastUsed: true,
  showSortMenu: true,
  excludeSystemFolders: true,
  excludePatterns: ['^\\..+$', '^temp$', '^backup$'],
  customSortOrder: {}
};