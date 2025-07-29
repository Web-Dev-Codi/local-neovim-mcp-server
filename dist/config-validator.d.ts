export declare class ConfigValidationService {
    validateConfig(config: string, filetype?: string): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    generateConfig(useCase: string, description?: string): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private validateLuaConfig;
    private validateVimConfig;
    private formatValidationResult;
    private generateKeymaps;
    private generateAutocmds;
    private generatePluginSetup;
    private generateOptions;
    private generateLSPConfig;
    private generateColorscheme;
    private generateStatusline;
    private generateTelescope;
    private generateTreesitter;
}
//# sourceMappingURL=config-validator.d.ts.map