# Neovim MCP Server

An MCP (Model Context Protocol) server that provides Neovim documentation, configuration validation, and best practices assistance.

## Features

- **Search Neovim Documentation**: Find functions, options, commands, and API methods
- **Get Help Topics**: Retrieve detailed help for specific Neovim topics
- **Validate Configuration**: Check Lua and Vim configurations for common issues
- **Generate Configuration**: Create configuration examples for common use cases
- **Explain Concepts**: Get explanations of Neovim concepts and features

## Installation

```bash
npm install
npm run build
```

## Usage

The server can be used with any MCP-compatible client. It provides the following tools:

### search_nvim_docs
Search Neovim documentation for functions, options, and commands.

```json
{
  "query": "buffer",
  "type": "function"
}
```

### get_nvim_help
Get detailed help for a specific Neovim topic.

```json
{
  "topic": "autocmd"
}
```

### validate_nvim_config
Validate Neovim configuration syntax and best practices.

```json
{
  "config": "vim.opt.number = true",
  "filetype": "lua"
}
```

### generate_nvim_config
Generate configuration examples for common use cases.

```json
{
  "use_case": "keymaps",
  "description": "Basic navigation keymaps"
}
```

### explain_nvim_concept
Explain Neovim concepts and features.

```json
{
  "concept": "buffers"
}
```

## Running the Server

```bash
npm start
```

The server runs on stdio and can be connected to any MCP-compatible client.

## Configuration Types

The server supports generating configurations for:

- `keymaps` - Key mappings
- `autocmds` - Autocommands
- `plugin_setup` - Plugin manager setup
- `options` - Vim options
- `lsp_config` - LSP configuration
- `colorscheme` - Theme setup
- `statusline` - Status line configuration
- `telescope` - Telescope fuzzy finder
- `treesitter` - Syntax highlighting

## Validation Features

- Detects deprecated functions and suggests alternatives
- Identifies potential performance issues
- Suggests modern Lua API usage
- Checks for common configuration mistakes
- Provides best practice recommendations