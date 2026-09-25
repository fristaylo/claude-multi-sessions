# Changelog

## 0.2.0

- The extension updates itself from GitHub Releases of [fristaylo/multi-claude](https://github.com/fristaylo/multi-claude): on startup it installs a newer `.vsix` if there is one and offers to reload the window

## 0.1.0

Initial release.

- Up to five independent Claude Code sessions, each with its own icon in the activity bar
- `multiClaude.count` setting controls how many session icons are shown
- The hook into the Claude Code bundle is re-applied automatically after Claude Code updates
- **MultiClaude: Restore original Claude Code** restores the untouched bundle from a backup
