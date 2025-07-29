export class NvimDocumentationService {
    NVIM_DOCS_BASE = 'https://neovim.io/doc/user/';
    NVIM_API_BASE = 'https://neovim.io/doc/api/';
    docCache = new Map();
    async searchDocs(query, type = 'all') {
        const results = [];
        try {
            if (type === 'all' || type === 'function') {
                const functionResults = await this.searchFunctions(query);
                results.push(...functionResults);
            }
            if (type === 'all' || type === 'option') {
                const optionResults = await this.searchOptions(query);
                results.push(...optionResults);
            }
            if (type === 'all' || type === 'command') {
                const commandResults = await this.searchCommands(query);
                results.push(...commandResults);
            }
            if (type === 'all' || type === 'api') {
                const apiResults = await this.searchAPI(query);
                results.push(...apiResults);
            }
        }
        catch (error) {
            console.error('Error searching docs:', error);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: results.length > 0
                        ? this.formatSearchResults(results, query)
                        : `No documentation found for "${query}". Try a different search term or check the spelling.`,
                },
            ],
        };
    }
    async getHelp(topic) {
        try {
            const helpContent = await this.fetchHelpTopic(topic);
            return {
                content: [
                    {
                        type: 'text',
                        text: helpContent || `Help topic "${topic}" not found. Common topics include: autocmd, map, lua, options, functions, etc.`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error retrieving help for "${topic}": ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
            };
        }
    }
    async explainConcept(concept) {
        const explanations = {
            buffers: `Buffers in Neovim:
- A buffer is the in-memory text of a file
- Use :ls or :buffers to list all buffers
- Switch buffers with :b<number> or :buffer <name>
- Common commands: :bnext, :bprev, :bfirst, :blast
- Each buffer has a unique number and can be hidden or visible`,
            windows: `Windows in Neovim:
- A window is a viewport onto a buffer
- Split windows: :split (horizontal) or :vsplit (vertical)
- Navigate: Ctrl-w + h/j/k/l or Ctrl-w + arrow keys
- Resize: Ctrl-w + +/- for height, Ctrl-w + </> for width
- Close: :q or Ctrl-w + c`,
            modes: `Neovim Modes:
- Normal mode: Default mode for navigation and commands
- Insert mode: For text entry (i, a, o, etc.)
- Visual mode: For text selection (v, V, Ctrl-v)
- Command mode: For ex commands (:)
- Terminal mode: For terminal emulation (:term)`,
            'lua api': `Neovim Lua API:
- vim.api: Core API functions (vim.api.nvim_buf_set_lines)
- vim.fn: Vimscript functions (vim.fn.expand)
- vim.opt: Options (vim.opt.number = true)
- vim.keymap: Keymaps (vim.keymap.set)
- vim.autocmd: Autocommands (vim.api.nvim_create_autocmd)`,
            plugins: `Neovim Plugin Management:
- Use a plugin manager like lazy.nvim, packer.nvim, or vim-plug
- Place plugins in ~/.config/nvim/lua/plugins/
- Configure in init.lua or separate module files
- Common plugin categories: LSP, completion, fuzzy finding, syntax highlighting`,
            lsp: `Language Server Protocol (LSP) in Neovim:
- Built-in LSP client since Neovim 0.5
- Configure servers with nvim-lspconfig
- Key functions: vim.lsp.buf.hover(), vim.lsp.buf.definition()
- Diagnostic functions: vim.diagnostic.open_float()
- Setup servers in lua/lsp/ directory`,
        };
        const explanation = explanations[concept.toLowerCase()] ||
            `Concept "${concept}" not found. Available concepts: ${Object.keys(explanations).join(', ')}`;
        return {
            content: [
                {
                    type: 'text',
                    text: explanation,
                },
            ],
        };
    }
    async searchFunctions(query) {
        const functions = [
            { name: 'vim.api.nvim_buf_set_lines', description: 'Set buffer lines', category: 'API' },
            { name: 'vim.api.nvim_win_set_cursor', description: 'Set window cursor position', category: 'API' },
            { name: 'vim.fn.expand', description: 'Expand wildcards and variables', category: 'Function' },
            { name: 'vim.fn.glob', description: 'Expand file glob patterns', category: 'Function' },
            { name: 'vim.keymap.set', description: 'Set keymaps', category: 'Keymap' },
            { name: 'vim.opt.number', description: 'Show line numbers', category: 'Option' },
        ];
        return functions.filter(fn => fn.name.toLowerCase().includes(query.toLowerCase()) ||
            fn.description.toLowerCase().includes(query.toLowerCase()));
    }
    async searchOptions(query) {
        const options = [
            { name: 'number', description: 'Show line numbers', type: 'boolean' },
            { name: 'relativenumber', description: 'Show relative line numbers', type: 'boolean' },
            { name: 'tabstop', description: 'Number of spaces for tab', type: 'number' },
            { name: 'shiftwidth', description: 'Number of spaces for indent', type: 'number' },
            { name: 'expandtab', description: 'Use spaces instead of tabs', type: 'boolean' },
            { name: 'wrap', description: 'Wrap long lines', type: 'boolean' },
        ];
        return options.filter(opt => opt.name.toLowerCase().includes(query.toLowerCase()) ||
            opt.description.toLowerCase().includes(query.toLowerCase()));
    }
    async searchCommands(query) {
        const commands = [
            { name: ':edit', description: 'Edit a file', syntax: ':edit [file]' },
            { name: ':write', description: 'Write current buffer', syntax: ':write [file]' },
            { name: ':quit', description: 'Quit current window', syntax: ':quit' },
            { name: ':split', description: 'Split window horizontally', syntax: ':split [file]' },
            { name: ':vsplit', description: 'Split window vertically', syntax: ':vsplit [file]' },
        ];
        return commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase()));
    }
    async searchAPI(query) {
        const apiMethods = [
            { name: 'nvim_buf_get_lines', description: 'Get buffer lines', params: 'buffer, start, end, strict_indexing' },
            { name: 'nvim_buf_set_lines', description: 'Set buffer lines', params: 'buffer, start, end, strict_indexing, replacement' },
            { name: 'nvim_win_get_cursor', description: 'Get cursor position', params: 'window' },
            { name: 'nvim_win_set_cursor', description: 'Set cursor position', params: 'window, pos' },
        ];
        return apiMethods.filter(api => api.name.toLowerCase().includes(query.toLowerCase()) ||
            api.description.toLowerCase().includes(query.toLowerCase()));
    }
    formatSearchResults(results, query) {
        let output = `Search results for "${query}":\n\n`;
        results.forEach((result, index) => {
            output += `${index + 1}. **${result.name}**\n`;
            output += `   Description: ${result.description}\n`;
            if (result.category)
                output += `   Category: ${result.category}\n`;
            if (result.type)
                output += `   Type: ${result.type}\n`;
            if (result.syntax)
                output += `   Syntax: ${result.syntax}\n`;
            if (result.params)
                output += `   Parameters: ${result.params}\n`;
            output += '\n';
        });
        return output;
    }
    async fetchHelpTopic(topic) {
        const helpTopics = {
            autocmd: `Autocommands (:help autocmd)

Autocommands are commands that are executed automatically on certain events.

Basic syntax:
  :autocmd [group] {event} {pattern} {cmd}

Common events:
  BufRead, BufNewFile - when reading/creating files
  BufWrite, BufWritePre - before/after writing
  InsertEnter, InsertLeave - entering/leaving insert mode
  VimEnter - after Vim starts

Lua API:
  vim.api.nvim_create_autocmd("BufRead", {
    pattern = "*.lua",
    callback = function()
      print("Lua file opened")
    end
  })`,
            map: `Key mapping (:help map)

Create custom key bindings in Neovim.

Vim commands:
  :map - for normal, visual, operator-pending modes
  :nmap - normal mode only
  :imap - insert mode only
  :vmap - visual mode only

Lua API:
  vim.keymap.set('n', '<leader>f', ':find ', { desc = 'Find file' })
  vim.keymap.set('i', 'jk', '<Esc>', { desc = 'Exit insert mode' })

Special keys: <leader>, <CR>, <Esc>, <C-x>, <A-x>, <S-x>`,
            lua: `Lua in Neovim (:help lua)

Neovim has built-in Lua support for configuration and scripting.

Key namespaces:
  vim.api - Core API functions
  vim.fn - Vimscript functions
  vim.opt - Options
  vim.keymap - Key mappings
  vim.cmd - Execute Vim commands

Example:
  vim.opt.number = true
  vim.keymap.set('n', '<leader>w', ':write<CR>')
  vim.api.nvim_buf_set_lines(0, 0, -1, false, {'Hello', 'World'})`,
        };
        return helpTopics[topic.toLowerCase()] || '';
    }
}
//# sourceMappingURL=nvim-docs.js.map