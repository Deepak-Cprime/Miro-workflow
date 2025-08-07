import { MiroClient } from './miroClient.js';
import { WorkflowAnalysis } from '../types/miro.js';
export declare class WorkflowAnalyzer {
    private miroClient;
    constructor(miroAccessToken: string);
    getMiroClient(): MiroClient;
    analyzeBoardWorkflow(boardId: string): Promise<WorkflowAnalysis>;
    private buildWorkflowNodes;
    private buildWorkflowConnections;
    private analyzeGroups;
    private extractItemContent;
    private generateWorkflowInsights;
    private generateRecommendations;
}
