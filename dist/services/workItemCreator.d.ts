import { OpenAIWorkflowInsights } from './openaiAnalyzer.js';
export interface WorkItemResult {
    success: boolean;
    id?: number;
    name: string;
    error?: string;
}
export interface WorkItemCreationResults {
    epics: WorkItemResult[];
    features: WorkItemResult[];
    userStories: WorkItemResult[];
}
export declare class WorkItemCreator {
    private apiClient;
    private projectId;
    constructor(baseUrl: string, accessToken: string, projectId?: number);
    createProject(workflowName: string): Promise<WorkItemResult>;
    createWorkItems(insights: OpenAIWorkflowInsights, workflowName?: string): Promise<WorkItemCreationResults>;
    private createEpic;
    private createFeature;
    private createUserStory;
}
