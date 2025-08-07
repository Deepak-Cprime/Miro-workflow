#!/usr/bin/env node
export declare class MiroWorkflowAnalyzerApp {
    private workflowAnalyzer;
    private openaiAnalyzer;
    private workItemCreator;
    constructor(projectId?: string);
    analyzeBoardWorkflow(boardId: string, outputDir?: string): Promise<void>;
    listBoards(): Promise<any>;
}
