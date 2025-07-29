# Connecting nvim-mcp Server to Windsurf and codecompanion.nvim

This tutorial explains how to integrate the nvim-mcp server with Windsurf IDE and codecompanion.nvim plugin to enhance your Neovim development experience with AI-powered documentation and configuration assistance.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the MCP Server](#building-the-mcp-server)
- [Connecting to Windsurf](#connecting-to-windsurf)
- [Connecting to codecompanion.nvim](#connecting-to-codecompanionnvim)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Neovim (v0.9 or higher)
- Windsurf IDE (if using Windsurf integration)
- codecompanion.nvim plugin installed (if using Neovim integration)

## Building the MCP Server

1. **Clone and setup the nvim-mcp server:**
   ```bash
   git clone <your-repo-url>
   cd nvim-mcp
   npm install
   npm run build
   ```

2. **Verify the server works:**
   ```bash
   npm run dev
   # Should output: "Neovim MCP Server running on stdio"
   ```

## Connecting to Windsurf

Windsurf supports MCP servers through its configuration system.

### Step 1: Configure Windsurf MCP Settings

1. Open Windsurf IDE
2. Go to Settings → Extensions → MCP Servers
3. Add a new MCP server configuration:

```json
{
  "mcpServers": {
    "nvim-docs": {
      "command": "node",
      "args": ["/path/to/nvim-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### Step 2: Alternative Configuration via Settings File

Create or edit your Windsurf settings file (usually in `~/.config/windsurf/settings.json`):

```json
{
  "mcp.servers": {
    "nvim-docs": {
      "command": "node",
      "args": ["/absolute/path/to/nvim-mcp/dist/index.js"],
      "description": "Neovim documentation and configuration assistant"
    }
  }
}
```

### Step 3: Restart Windsurf

Restart Windsurf IDE to load the new MCP server configuration.

### Step 4: Verify Connection

1. Open the command palette (Ctrl/Cmd + Shift + P)
2. Look for MCP-related commands or check the MCP status in the status bar
3. You should see the nvim-mcp server listed as connected

## Connecting to codecompanion.nvim

codecompanion.nvim is a Neovim plugin that provides AI assistance with support for MCP servers.

### Step 1: Install codecompanion.nvim

Using lazy.nvim:

```lua
{
  "olimorris/codecompanion.nvim",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-treesitter/nvim-treesitter",
    "nvim-telescope/telescope.nvim", -- Optional
  },
  config = function()
    require("codecompanion").setup({
      -- Configuration will be added in next step
    })
  end
}
```

Using packer.nvim:

```lua
use {
  "olimorris/codecompanion.nvim",
  requires = {
    "nvim-lua/plenary.nvim",
    "nvim-treesitter/nvim-treesitter",
    "nvim-telescope/telescope.nvim", -- Optional
  },
  config = function()
    require("codecompanion").setup({
      -- Configuration will be added in next step
    })
  end
}
```

### Step 2: Configure MCP Server in codecompanion.nvim

Add the nvim-mcp server to your codecompanion configuration:

```lua
require("codecompanion").setup({
  adapters = {
    -- Your existing adapters (anthropic, openai, etc.)
  },
  mcp = {
    servers = {
      ["nvim-docs"] = {
        command = "node",
        args = { "/absolute/path/to/nvim-mcp/dist/index.js" },
        description = "Neovim documentation and configuration assistant",
        tools = {
          "search_nvim_docs",
          "get_nvim_help",
          "validate_nvim_config",
          "generate_nvim_config",
          "explain_nvim_concept"
        }
      }
    }
  }
})
```

### Step 3: Set Up Keybindings

Add convenient keybindings for codecompanion:

```lua
vim.keymap.set("n", "<leader>cc", "<cmd>CodeCompanionChat<cr>", { desc = "Open CodeCompanion chat" })
vim.keymap.set("v", "<leader>cc", "<cmd>CodeCompanionChat<cr>", { desc = "Open CodeCompanion chat with selection" })
vim.keymap.set("n", "<leader>ca", "<cmd>CodeCompanionActions<cr>", { desc = "CodeCompanion actions" })
vim.keymap.set("n", "<leader>ct", "<cmd>CodeCompanionToggle<cr>", { desc = "Toggle CodeCompanion" })
```

### Step 4: Verify Installation

1. Restart Neovim
2. Run `:CodeCompanionChat` to open the chat interface
3. The nvim-mcp tools should be available for the AI assistant to use

## Available Tools

The nvim-mcp server provides these tools:

### 1. `search_nvim_docs`
Search Neovim documentation for functions, options, and commands.

**Parameters:**
- `query` (string): Search term
- `type` (string, optional): Type of documentation (`function`, `option`, `command`, `api`, `all`)

### 2. `get_nvim_help`
Get detailed help for a specific Neovim topic.

**Parameters:**
- `topic` (string): Help topic (e.g., "autocmd", "map", "lua")

### 3. `validate_nvim_config`
Validate Neovim configuration syntax and best practices.

**Parameters:**
- `config` (string): Configuration code to validate
- `filetype` (string, optional): File type (`lua` or `vim`)

### 4. `generate_nvim_config`
Generate Neovim configuration examples for common use cases.

**Parameters:**
- `use_case` (string): Type of configuration (`keymaps`, `autocmds`, `plugin_setup`, `options`, `lsp_config`, `colorscheme`, `statusline`, `telescope`, `treesitter`)
- `description` (string, optional): Specific requirements

### 5. `explain_nvim_concept`
Explain Neovim concepts, features, and best practices.

**Parameters:**
- `concept` (string): Concept to explain (e.g., "buffers", "windows", "modes", "lua API")

## Usage Examples

### In Windsurf

1. Open a chat or command interface
2. Ask questions like:
   - "How do I set up LSP in Neovim?"
   - "Search for telescope configuration options"
   - "Validate this Neovim configuration: [paste config]"

### In codecompanion.nvim

1. Open CodeCompanion chat with `<leader>cc`
2. Ask Neovim-specific questions:
   - "Generate a keymap configuration for buffer navigation"
   - "Explain how Neovim buffers work"
   - "Help me set up autocommands for Python files"

The AI will automatically use the nvim-mcp tools to provide accurate, up-to-date information.

## Troubleshooting

### Common Issues

#### Server Not Starting
- **Check Node.js version:** Ensure you have Node.js v18+
- **Verify build:** Run `npm run build` to ensure TypeScript compilation succeeds
- **Check paths:** Make sure all file paths in configurations are absolute paths

#### MCP Server Not Connecting
- **Restart the client:** Restart Windsurf or Neovim after configuration changes
- **Check logs:** Look for error messages in the client's console/logs
- **Test manually:** Run `node /path/to/nvim-mcp/dist/index.js` to test the server directly

#### Tools Not Available
- **Verify configuration:** Ensure the MCP server is properly configured in your client
- **Check server status:** Confirm the server is running and connected
- **Update configuration:** Make sure all tool names match exactly

### Debug Mode

To run the server in debug mode:

```bash
DEBUG=* node dist/index.js
```

### Getting Help

If you encounter issues:

1. Check the server logs for error messages
2. Verify your configuration matches the examples exactly
3. Ensure all file paths are absolute and correct
4. Test the server independently before integrating with clients

## Contributing

To contribute to the nvim-mcp server:

1. Fork the repository
2. Make your changes
3. Add tests for new functionality
4. Submit a pull request

## License

[Add your license information here]