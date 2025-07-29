export class ConfigValidationService {
  async validateConfig(config: string, filetype: string = 'lua') {
    const issues: string[] = [];
    const suggestions: string[] = [];

    try {
      if (filetype === 'lua') {
        this.validateLuaConfig(config, issues, suggestions);
      } else if (filetype === 'vim') {
        this.validateVimConfig(config, issues, suggestions);
      }

      const result = this.formatValidationResult(issues, suggestions);
      
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  async generateConfig(useCase: string, description?: string) {
    const configs: Record<string, () => string> = {
      keymaps: () => this.generateKeymaps(description),
      autocmds: () => this.generateAutocmds(description),
      plugin_setup: () => this.generatePluginSetup(description),
      options: () => this.generateOptions(description),
      lsp_config: () => this.generateLSPConfig(description),
      colorscheme: () => this.generateColorscheme(description),
      statusline: () => this.generateStatusline(description),
      telescope: () => this.generateTelescope(description),
      treesitter: () => this.generateTreesitter(description),
    };

    const generator = configs[useCase];
    if (!generator) {
      return {
        content: [
          {
            type: 'text',
            text: `Unknown use case: ${useCase}. Available: ${Object.keys(configs).join(', ')}`,
          },
        ],
      };
    }

    const config = generator();
    
    return {
      content: [
        {
          type: 'text',
          text: `Generated ${useCase} configuration:\n\n\`\`\`lua\n${config}\n\`\`\``,
        },
      ],
    };
  }

  private validateLuaConfig(config: string, issues: string[], suggestions: string[]) {
    const lines = config.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check for common issues
      if (trimmed.includes('vim.o.') || trimmed.includes('vim.wo.') || trimmed.includes('vim.bo.')) {
        suggestions.push(`Line ${lineNum}: Consider using vim.opt instead of vim.o/vim.wo/vim.bo for better type checking`);
      }

      if (trimmed.includes('vim.api.nvim_set_keymap')) {
        suggestions.push(`Line ${lineNum}: Consider using vim.keymap.set() instead of vim.api.nvim_set_keymap() for simpler syntax`);
      }

      if (trimmed.includes('vim.cmd(') && trimmed.includes("'")) {
        suggestions.push(`Line ${lineNum}: Use double quotes for vim.cmd() strings to avoid escaping issues`);
      }

      // Check for deprecated functions
      if (trimmed.includes('vim.lsp.diagnostic')) {
        issues.push(`Line ${lineNum}: vim.lsp.diagnostic is deprecated, use vim.diagnostic instead`);
      }

      // Check for missing require statements
      if (trimmed.includes('require(') && !trimmed.includes('local ')) {
        suggestions.push(`Line ${lineNum}: Consider storing require() result in a local variable for better performance`);
      }

      // Check for basic syntax issues
      if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('~=') && !trimmed.includes('local ') && !trimmed.includes('vim.')) {
        if (!trimmed.match(/^\w+\s*=/)) {
          issues.push(`Line ${lineNum}: Possible global variable assignment, consider using 'local'`);
        }
      }
    });

    // Check for missing common setups
    if (!config.includes('vim.opt') && !config.includes('vim.o')) {
      suggestions.push('Consider setting up basic options like vim.opt.number, vim.opt.expandtab, etc.');
    }

    if (config.includes('require') && !config.includes('pcall')) {
      suggestions.push('Consider using pcall() to safely require modules that might not be installed');
    }
  }

  private validateVimConfig(config: string, issues: string[], suggestions: string[]) {
    const lines = config.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check for deprecated syntax
      if (trimmed.startsWith('autocmd!')) {
        suggestions.push(`Line ${lineNum}: Consider using augroup with autocmd! for better organization`);
      }

      if (trimmed.includes('nnoremap') || trimmed.includes('inoremap')) {
        suggestions.push(`Line ${lineNum}: Consider migrating to Lua configuration for better maintainability`);
      }

      // Check for common issues
      if (trimmed.includes('map ') && !trimmed.includes('noremap')) {
        issues.push(`Line ${lineNum}: Use 'noremap' instead of 'map' to avoid recursive mappings`);
      }
    });

    suggestions.push('Consider migrating to Lua configuration for better features and maintainability');
  }

  private formatValidationResult(issues: string[], suggestions: string[]): string {
    let result = '';

    if (issues.length === 0 && suggestions.length === 0) {
      result = '✅ Configuration looks good! No issues found.';
    } else {
      if (issues.length > 0) {
        result += '❌ **Issues found:**\n';
        issues.forEach(issue => {
          result += `  - ${issue}\n`;
        });
        result += '\n';
      }

      if (suggestions.length > 0) {
        result += '💡 **Suggestions:**\n';
        suggestions.forEach(suggestion => {
          result += `  - ${suggestion}\n`;
        });
      }
    }

    return result;
  }

  private generateKeymaps(description?: string): string {
    return `-- Keymaps configuration
local keymap = vim.keymap.set

-- Leader key
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Normal mode mappings
keymap("n", "<leader>w", "<cmd>write<CR>", { desc = "Save file" })
keymap("n", "<leader>q", "<cmd>quit<CR>", { desc = "Quit" })
keymap("n", "<leader>h", "<cmd>nohlsearch<CR>", { desc = "Clear highlights" })

-- Buffer navigation
keymap("n", "<S-h>", "<cmd>bprevious<CR>", { desc = "Previous buffer" })
keymap("n", "<S-l>", "<cmd>bnext<CR>", { desc = "Next buffer" })

-- Window navigation
keymap("n", "<C-h>", "<C-w>h", { desc = "Go to left window" })
keymap("n", "<C-j>", "<C-w>j", { desc = "Go to lower window" })
keymap("n", "<C-k>", "<C-w>k", { desc = "Go to upper window" })
keymap("n", "<C-l>", "<C-w>l", { desc = "Go to right window" })

-- Insert mode mappings
keymap("i", "jk", "<Esc>", { desc = "Exit insert mode" })

-- Visual mode mappings
keymap("v", "<", "<gv", { desc = "Indent left" })
keymap("v", ">", ">gv", { desc = "Indent right" })`;
  }

  private generateAutocmds(description?: string): string {
    return `-- Autocommands configuration
local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- Highlight on yank
augroup("YankHighlight", { clear = true })
autocmd("TextYankPost", {
  group = "YankHighlight",
  callback = function()
    vim.highlight.on_yank()
  end,
})

-- Remove whitespace on save
augroup("TrimWhitespace", { clear = true })
autocmd("BufWritePre", {
  group = "TrimWhitespace",
  pattern = "*",
  command = "%s/\\s\\+$//e",
})

-- Auto resize panes when resizing nvim window
augroup("ResizePanes", { clear = true })
autocmd("VimResized", {
  group = "ResizePanes",
  callback = function()
    vim.cmd("tabdo wincmd =")
  end,
})

-- Go to last loc when opening a buffer
augroup("LastLocation", { clear = true })
autocmd("BufReadPost", {
  group = "LastLocation",
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})`;
  }

  private generatePluginSetup(description?: string): string {
    return `-- Plugin setup with lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
  -- Colorscheme
  {
    "catppuccin/nvim",
    name = "catppuccin",
    priority = 1000,
    config = function()
      vim.cmd.colorscheme("catppuccin")
    end,
  },

  -- File explorer
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = "nvim-tree/nvim-web-devicons",
    config = function()
      require("nvim-tree").setup()
    end,
  },

  -- Fuzzy finder
  {
    "nvim-telescope/telescope.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("telescope").setup()
    end,
  },

  -- LSP
  {
    "neovim/nvim-lspconfig",
    dependencies = {
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
    },
    config = function()
      require("mason").setup()
      require("mason-lspconfig").setup()
    end,
  },
})`;
  }

  private generateOptions(description?: string): string {
    return `-- Options configuration
local opt = vim.opt

-- Line numbers
opt.number = true
opt.relativenumber = true

-- Tabs & indentation
opt.tabstop = 2
opt.shiftwidth = 2
opt.expandtab = true
opt.autoindent = true

-- Line wrapping
opt.wrap = false

-- Search settings
opt.ignorecase = true
opt.smartcase = true

-- Cursor line
opt.cursorline = true

-- Appearance
opt.termguicolors = true
opt.background = "dark"
opt.signcolumn = "yes"

-- Backspace
opt.backspace = "indent,eol,start"

-- Clipboard
opt.clipboard:append("unnamedplus")

-- Split windows
opt.splitright = true
opt.splitbelow = true

-- Consider string-string as whole word
opt.iskeyword:append("-")

-- Disable the mouse
opt.mouse = ""

-- Undo settings
opt.undofile = true
opt.undodir = vim.fn.expand("~/.config/nvim/undo")

-- Update time
opt.updatetime = 250
opt.timeoutlen = 300

-- Completion
opt.completeopt = "menuone,noselect"`;
  }

  private generateLSPConfig(description?: string): string {
    return `-- LSP configuration
local lspconfig = require("lspconfig")

-- Set up completion
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = require("cmp_nvim_lsp").default_capabilities(capabilities)

-- Diagnostic configuration
vim.diagnostic.config({
  virtual_text = true,
  signs = true,
  underline = true,
  update_in_insert = false,
  severity_sort = false,
})

-- LSP keymaps
local on_attach = function(client, bufnr)
  local opts = { noremap = true, silent = true, buffer = bufnr }
  
  vim.keymap.set("n", "gD", vim.lsp.buf.declaration, opts)
  vim.keymap.set("n", "gd", vim.lsp.buf.definition, opts)
  vim.keymap.set("n", "K", vim.lsp.buf.hover, opts)
  vim.keymap.set("n", "gi", vim.lsp.buf.implementation, opts)
  vim.keymap.set("n", "<C-k>", vim.lsp.buf.signature_help, opts)
  vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts)
  vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts)
  vim.keymap.set("n", "gr", vim.lsp.buf.references, opts)
  vim.keymap.set("n", "<leader>d", vim.diagnostic.open_float, opts)
  vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, opts)
  vim.keymap.set("n", "]d", vim.diagnostic.goto_next, opts)
end

-- Language servers
local servers = { "lua_ls", "tsserver", "pyright", "rust_analyzer" }

for _, lsp in ipairs(servers) do
  lspconfig[lsp].setup({
    on_attach = on_attach,
    capabilities = capabilities,
  })
end

-- Lua LSP specific settings
lspconfig.lua_ls.setup({
  on_attach = on_attach,
  capabilities = capabilities,
  settings = {
    Lua = {
      diagnostics = {
        globals = { "vim" },
      },
    },
  },
})`;
  }

  private generateColorscheme(description?: string): string {
    return `-- Colorscheme configuration
-- Using catppuccin theme
require("catppuccin").setup({
  flavour = "mocha", -- latte, frappe, macchiato, mocha
  background = { -- :h background
    light = "latte",
    dark = "mocha",
  },
  transparent_background = false,
  show_end_of_buffer = false,
  term_colors = false,
  dim_inactive = {
    enabled = false,
    shade = "dark",
    percentage = 0.15,
  },
  no_italic = false,
  no_bold = false,
  no_underline = false,
  styles = {
    comments = { "italic" },
    conditionals = { "italic" },
    loops = {},
    functions = {},
    keywords = {},
    strings = {},
    variables = {},
    numbers = {},
    booleans = {},
    properties = {},
    types = {},
    operators = {},
  },
  color_overrides = {},
  custom_highlights = {},
  integrations = {
    cmp = true,
    gitsigns = true,
    nvimtree = true,
    telescope = true,
    notify = false,
    mini = false,
  },
})

-- Setup the colorscheme
vim.cmd.colorscheme("catppuccin")`;
  }

  private generateStatusline(description?: string): string {
    return `-- Statusline configuration using lualine
require("lualine").setup({
  options = {
    icons_enabled = true,
    theme = "auto",
    component_separators = { left = "", right = "" },
    section_separators = { left = "", right = "" },
    disabled_filetypes = {
      statusline = {},
      winbar = {},
    },
    ignore_focus = {},
    always_divide_middle = true,
    globalstatus = false,
    refresh = {
      statusline = 1000,
      tabline = 1000,
      winbar = 1000,
    }
  },
  sections = {
    lualine_a = {"mode"},
    lualine_b = {"branch", "diff", "diagnostics"},
    lualine_c = {"filename"},
    lualine_x = {"encoding", "fileformat", "filetype"},
    lualine_y = {"progress"},
    lualine_z = {"location"}
  },
  inactive_sections = {
    lualine_a = {},
    lualine_b = {},
    lualine_c = {"filename"},
    lualine_x = {"location"},
    lualine_y = {},
    lualine_z = {}
  },
  tabline = {},
  winbar = {},
  inactive_winbar = {},
  extensions = {"nvim-tree", "quickfix"}
})`;
  }

  private generateTelescope(description?: string): string {
    return `-- Telescope configuration
local telescope = require("telescope")
local actions = require("telescope.actions")

telescope.setup({
  defaults = {
    mappings = {
      i = {
        ["<C-n>"] = actions.cycle_history_next,
        ["<C-p>"] = actions.cycle_history_prev,
        ["<C-j>"] = actions.move_selection_next,
        ["<C-k>"] = actions.move_selection_previous,
        ["<C-c>"] = actions.close,
        ["<Down>"] = actions.move_selection_next,
        ["<Up>"] = actions.move_selection_previous,
        ["<CR>"] = actions.select_default,
        ["<C-x>"] = actions.select_horizontal,
        ["<C-v>"] = actions.select_vertical,
        ["<C-t>"] = actions.select_tab,
        ["<C-u>"] = actions.preview_scrolling_up,
        ["<C-d>"] = actions.preview_scrolling_down,
      },
    },
  },
  pickers = {
    find_files = {
      theme = "dropdown",
    }
  },
  extensions = {}
})

-- Keymaps
local keymap = vim.keymap.set
keymap("n", "<leader>ff", "<cmd>Telescope find_files<cr>", { desc = "Find files" })
keymap("n", "<leader>fg", "<cmd>Telescope live_grep<cr>", { desc = "Live grep" })
keymap("n", "<leader>fb", "<cmd>Telescope buffers<cr>", { desc = "Find buffers" })
keymap("n", "<leader>fh", "<cmd>Telescope help_tags<cr>", { desc = "Help tags" })`;
  }

  private generateTreesitter(description?: string): string {
    return `-- Treesitter configuration
require("nvim-treesitter.configs").setup({
  ensure_installed = {
    "c",
    "lua",
    "vim",
    "vimdoc",
    "query",
    "javascript",
    "typescript",
    "python",
    "rust",
    "go",
    "html",
    "css",
    "json",
    "yaml",
    "markdown",
    "bash",
  },
  sync_install = false,
  highlight = {
    enable = true,
    additional_vim_regex_highlighting = false,
  },
  indent = {
    enable = true,
  },
  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = "gnn",
      node_incremental = "grn",
      scope_incremental = "grc",
      node_decremental = "grm",
    },
  },
  textobjects = {
    select = {
      enable = true,
      lookahead = true,
      keymaps = {
        ["af"] = "@function.outer",
        ["if"] = "@function.inner",
        ["ac"] = "@class.outer",
        ["ic"] = "@class.inner",
      },
    },
  },
})`;
  }
}