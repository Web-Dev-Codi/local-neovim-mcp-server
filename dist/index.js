import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { NvimDocumentationService } from './nvim-docs.js';
import { ConfigValidationService } from './config-validator.js';
const server = new Server({
    name: 'nvim-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
const docsService = new NvimDocumentationService();
const configService = new ConfigValidationService();
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'search_nvim_docs',
                description: 'Search Neovim documentation for functions, options, and commands',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query for Neovim documentation',
                        },
                        type: {
                            type: 'string',
                            enum: ['function', 'option', 'command', 'api', 'all'],
                            description: 'Type of documentation to search',
                            default: 'all',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'get_nvim_help',
                description: 'Get detailed help for a specific Neovim topic',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'Help topic to retrieve (e.g., "autocmd", "map", "lua")',
                        },
                    },
                    required: ['topic'],
                },
            },
            {
                name: 'validate_nvim_config',
                description: 'Validate Neovim configuration syntax and best practices',
                inputSchema: {
                    type: 'object',
                    properties: {
                        config: {
                            type: 'string',
                            description: 'Neovim configuration code to validate',
                        },
                        filetype: {
                            type: 'string',
                            enum: ['lua', 'vim'],
                            description: 'Configuration file type',
                            default: 'lua',
                        },
                    },
                    required: ['config'],
                },
            },
            {
                name: 'generate_nvim_config',
                description: 'Generate Neovim configuration examples for common use cases',
                inputSchema: {
                    type: 'object',
                    properties: {
                        use_case: {
                            type: 'string',
                            description: 'Type of configuration to generate',
                            enum: [
                                'keymaps',
                                'autocmds',
                                'plugin_setup',
                                'options',
                                'lsp_config',
                                'colorscheme',
                                'statusline',
                                'telescope',
                                'treesitter',
                            ],
                        },
                        description: {
                            type: 'string',
                            description: 'Specific requirements or description of what to generate',
                        },
                    },
                    required: ['use_case'],
                },
            },
            {
                name: 'explain_nvim_concept',
                description: 'Explain Neovim concepts, features, and best practices',
                inputSchema: {
                    type: 'object',
                    properties: {
                        concept: {
                            type: 'string',
                            description: 'Neovim concept to explain (e.g., "buffers", "windows", "modes", "lua API")',
                        },
                    },
                    required: ['concept'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'search_nvim_docs':
                return await docsService.searchDocs(args?.query, args?.type || 'all');
            case 'get_nvim_help':
                return await docsService.getHelp(args?.topic);
            case 'validate_nvim_config':
                return await configService.validateConfig(args?.config, args?.filetype || 'lua');
            case 'generate_nvim_config':
                return await configService.generateConfig(args?.use_case, args?.description);
            case 'explain_nvim_concept':
                return await docsService.explainConcept(args?.concept);
            default:
                throw new Error(`Tool ${name} not found`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Neovim MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map