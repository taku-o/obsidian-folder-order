# Obsidian Folder Order Plugin

Control folder display order in Obsidian's file explorer with various sorting options.

## Features

This plugin adds a sorting menu to the file explorer that allows you to organize folders by:

- **Name (A→Z)**: Alphabetical order
- **Name (Z→A)**: Reverse alphabetical order  
- **Modified (Newest)**: Most recently modified folders first
- **Modified (Oldest)**: Oldest modified folders first
- **Created (Newest)**: Most recently created folders first
- **Created (Oldest)**: Oldest created folders first

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Navigate to Community Plugins
3. Search for "Folder Order Controller"
4. Install and enable the plugin

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/anthropics/obsidian-folder-order/releases)
2. Extract the files to your vault's `.obsidian/plugins/obsidian-folder-order/` directory
3. Enable the plugin in Obsidian Settings > Community Plugins

## Usage

1. **Access the Sort Menu**: A dropdown menu appears at the top of the file explorer
2. **Select Sort Method**: Choose your preferred sorting option from the dropdown
3. **Refresh**: Click the refresh button to manually update the folder order
4. **Settings**: Access plugin settings through Settings > Community Plugins > Folder Order Controller

## Configuration

### General Settings

- **Show sort menu**: Toggle the visibility of the sorting menu
- **Remember last used sort method**: Saves your last selected sorting option

### Default Sort Method

Choose the default sorting method that will be applied when Obsidian starts.

### Advanced Settings

- **Exclude system folders**: Automatically exclude system folders (like `.obsidian`, `.trash`)
- **Exclude patterns**: Use regular expressions to exclude specific folders
- **Reset settings**: Restore all settings to default values

## Supported Platforms

- ✅ **Desktop**: Windows, macOS, Linux
- ✅ **Mobile**: iOS, Android (basic functionality)

## Performance

- Optimized for large vaults with 1000+ folders
- Caching system reduces computational overhead
- Debounced refresh prevents excessive updates

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/anthropics/obsidian-folder-order.git
cd obsidian-folder-order

# Install dependencies
npm install

# Start development
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug reports**: [GitHub Issues](https://github.com/anthropics/obsidian-folder-order/issues)
- 💡 **Feature requests**: [GitHub Discussions](https://github.com/anthropics/obsidian-folder-order/discussions)
- 💬 **Community support**: [Obsidian Discord](https://discord.gg/obsidianmd)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details about changes in each version.

## Credits

- Built with [Obsidian Plugin API](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- Developed by [Claude Code](https://claude.ai/code)
- Icons by [Lucide](https://lucide.dev/)

## Related Plugins

- [File Tree Alternative](https://github.com/ozntel/file-tree-alternative) - Enhanced file explorer
- [File Explorer++](https://github.com/kzhovn/file-explorer-plus) - Advanced file management
- [Quick Switcher++](https://github.com/darlal/obsidian-switcher-plus) - Enhanced navigation

---

**Enjoy organized folder management in Obsidian!** 🗂️