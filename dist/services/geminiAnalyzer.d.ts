import { WorkflowAnalysis } from '../types/miro.js';
export interface GeminiWorkflowInsights {
    workflowSummary: string;
    processSteps: Array<{
        step: number;
        title: string;
        description: string;
        type: string;
        dependencies: string[];
    }>;
    processFlow: string;
    criticalPath: string[];
    potentialIssues: Array<{
        issue: string;
        severity: 'low' | 'medium' | 'high';
        recommendation: string;
    }>;
    optimizationSuggestions: string[];
    businessValue: string;
    estimatedDuration?: string;
    resourceRequirements?: string[];
}
export declare class GeminiAnalyzer {
    private genAI;
    private model;
    constructor(apiKey: string);
    analyzeWorkflow(workflowData: WorkflowAnalysis): Promise<GeminiWorkflowInsights>;
    private buildAnalysisPrompt;
    private parseGeminiResponse;
    generateWorkflowReport(workflowData: WorkflowAnalysis, geminiInsights: GeminiWorkflowInsights): Promise<string>;
    private createFallbackReport;
}
