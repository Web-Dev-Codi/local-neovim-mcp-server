export declare class NvimDocumentationService {
    private readonly NVIM_DOCS_BASE;
    private readonly NVIM_API_BASE;
    private readonly docCache;
    searchDocs(query: string, type?: string): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getHelp(topic: string): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    explainConcept(concept: string): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private searchFunctions;
    private searchOptions;
    private searchCommands;
    private searchAPI;
    private formatSearchResults;
    private fetchHelpTopic;
}
//# sourceMappingURL=nvim-docs.d.ts.map