import { WorkflowAnalysis } from '../types/miro.js';
export interface OpenAIWorkflowInsights {
    workflowSummary: string;
    epics: Array<{
        epicId: string;
        title: string;
        description: string;
        businessValue: string;
        acceptanceCriteria: string[];
        estimatedEffort: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    features: Array<{
        featureId: string;
        epicId: string;
        title: string;
        description: string;
        userStories: Array<{
            storyId: string;
            title: string;
            asA: string;
            iWant: string;
            soThat: string;
            acceptanceCriteria: string[];
            tasks?: Array<{
                taskId: string;
                title: string;
                description: string;
                estimatedHours: number;
            }>;
        }>;
    }>;
    targetProcessImplementation: {
        processName: string;
        targetSystem: string;
        implementationApproach: string;
        keyStakeholders: string[];
        successMetrics: string[];
    };
    businessValue: string;
    estimatedTimeToMarket?: string;
    riskAssessment?: Array<{
        risk: string;
        impact: 'high' | 'medium' | 'low';
        mitigation: string;
    }>;
}
export declare class OpenAIAnalyzer {
    private openai;
    constructor(apiKey: string);
    analyzeWorkflow(workflowData: WorkflowAnalysis): Promise<OpenAIWorkflowInsights>;
    private buildAnalysisPrompt;
    private parseOpenAIResponse;
    generateWorkflowReport(workflowData: WorkflowAnalysis, openaiInsights: OpenAIWorkflowInsights): Promise<string>;
    private createFallbackReport;
}
