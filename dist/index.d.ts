#!/usr/bin/env node
export declare class MiroWorkflowAnalyzerApp {
    private workflowAnalyzer;
    private openaiAnalyzer;
    private workItemCreator;
    constructor();
    analyzeBoardWorkflow(boardId: string, outputDir?: string, workflowName?: string): Promise<{
        projectId?: number;
    }>;
    listBoards(): Promise<any>;
}
