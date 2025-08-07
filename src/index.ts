#!/usr/bin/env node

import dotenv from 'dotenv';
import { WorkflowAnalyzer } from './services/workflowAnalyzer.js';
import { OpenAIAnalyzer } from './services/openaiAnalyzer.js';
import { WorkItemCreator } from './services/workItemCreator.js';
import { promises as fs } from 'fs';
import * as path from 'path';

dotenv.config();

export class MiroWorkflowAnalyzerApp {
  private workflowAnalyzer: WorkflowAnalyzer;
  private openaiAnalyzer: OpenAIAnalyzer;
  private workItemCreator: WorkItemCreator;

  constructor(projectId?: string) {
    const miroToken = process.env.MIRO_ACCESS_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.TARGET_API_BASE_URL;
    const accessToken = process.env.TARGET_API_ACCESS_TOKEN;
    const envProjectId = process.env.PROJECT_ID;

    // Use provided projectId or fall back to environment variable
    const finalProjectId = projectId || envProjectId;

    if (!miroToken) {
      throw new Error('MIRO_ACCESS_TOKEN environment variable is required');
    }

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    if (!baseUrl) {
      throw new Error('TARGET_API_BASE_URL environment variable is required');
    }

    if (!accessToken) {
      throw new Error('TARGET_API_ACCESS_TOKEN environment variable is required');
    }

    if (!finalProjectId) {
      throw new Error('PROJECT_ID must be provided as parameter or environment variable');
    }

    this.workflowAnalyzer = new WorkflowAnalyzer(miroToken);
    this.openaiAnalyzer = new OpenAIAnalyzer(openaiApiKey);
    this.workItemCreator = new WorkItemCreator(baseUrl, accessToken, parseInt(finalProjectId));
  }

  async analyzeBoardWorkflow(boardId: string, outputDir?: string): Promise<void> {
    try {
      console.log(`🔍 Starting analysis of Miro board: ${boardId}`);
      
      // Step 1: Extract workflow data from Miro
      console.log('📊 Extracting workflow data from Miro...');
      const workflowData = await this.workflowAnalyzer.analyzeBoardWorkflow(boardId);
      
      console.log(`✅ Extracted ${workflowData.nodes.length} nodes and ${workflowData.connections.length} connections`);
      
      // Step 2: Analyze with OpenAI
      console.log('🤖 Analyzing workflow with OpenAI GPT-4...');
      const openaiInsights = await this.openaiAnalyzer.analyzeWorkflow(workflowData);
      
      console.log('✅ AI analysis completed');
      
      // Step 3: Create work items via API
      console.log('🚀 Creating work items in target system...');
      const workItemResults = await this.workItemCreator.createWorkItems(openaiInsights);
      
      // Step 4: Generate comprehensive report (optional)
      console.log('📝 Generating comprehensive report...');
      const report = await this.openaiAnalyzer.generateWorkflowReport(workflowData, openaiInsights);
      
      // Step 5: Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputDirectory = outputDir || './output';
      
      // Ensure output directory exists
      await fs.mkdir(outputDirectory, { recursive: true });
      
      // Save raw workflow data with work item results
      const rawDataPath = path.join(outputDirectory, `workflow-data-${timestamp}.json`);
      await fs.writeFile(rawDataPath, JSON.stringify({
        workflowData,
        openaiInsights,
        workItemResults
      }, null, 2));
      
      // Save formatted report
      const reportPath = path.join(outputDirectory, `workflow-report-${timestamp}.md`);
      await fs.writeFile(reportPath, report);

      // Save work items JSON for reference
      const workItemsPath = path.join(outputDirectory, `work-items-${timestamp}.json`);
      await fs.writeFile(workItemsPath, JSON.stringify(workItemResults, null, 2));
      
      // Display summary
      console.log('\n🎉 Analysis Complete!');
      console.log('================================');
      console.log(`📋 Board: ${workflowData.boardInfo.name}`);
      console.log(`📊 Nodes: ${workflowData.nodes.length}`);
      console.log(`🔗 Connections: ${workflowData.connections.length}`);
      console.log(`🏷️  Tags: ${workflowData.tags.length}`);
      console.log(`👥 Groups: ${workflowData.groups.length}`);
      console.log(`📈 Entry Points: ${workflowData.insights.entryPoints.length}`);
      console.log(`📉 Exit Points: ${workflowData.insights.exitPoints.length}`);
      
      if (openaiInsights.epics.length > 0) {
        console.log(`📋 Epics Created: ${openaiInsights.epics.length}`);
      }
      
      if (openaiInsights.features.length > 0) {
        const totalUserStories = openaiInsights.features.reduce((total, feature) => total + feature.userStories.length, 0);
        console.log(`⚡ Features: ${openaiInsights.features.length}, User Stories: ${totalUserStories}`);
      }
      
      if (openaiInsights.riskAssessment && openaiInsights.riskAssessment.length > 0) {
        console.log(`⚠️  Risks Identified: ${openaiInsights.riskAssessment.length}`);
      }
      
      console.log('\n📁 Output Files:');
      console.log(`📄 Raw Data: ${rawDataPath}`);
      console.log(`📋 Report: ${reportPath}`);
      console.log(`🎯 Work Items: ${workItemsPath}`);
      
      console.log('\n🚀 Work Item Creation Results:');
      console.log(`✅ Epic Created: ${workItemResults.epic.success ? workItemResults.epic.id : 'Failed'}`);
      console.log(`✅ Features Created: ${workItemResults.features.filter(f => f.success).length}/${workItemResults.features.length}`);
      console.log(`✅ User Stories Created: ${workItemResults.userStories.filter(u => u.success).length}/${workItemResults.userStories.length}`);
      
      // Display quick insights
      console.log('\n🔍 Quick Insights:');
      console.log(`Summary: ${openaiInsights.workflowSummary}`);
      
      if (openaiInsights.estimatedTimeToMarket) {
        console.log(`⏱️ Time to Market: ${openaiInsights.estimatedTimeToMarket}`);
      }
      
      console.log(`🎯 Target System: ${openaiInsights.targetProcessImplementation.targetSystem}`);
      
      console.log('\n💼 Business Value:');
      console.log(openaiInsights.businessValue);
      
      if (openaiInsights.epics.length > 0) {
        console.log('\n📋 Top Epics:');
        openaiInsights.epics.slice(0, 3).forEach((epic, index) => {
          console.log(`${index + 1}. [${epic.priority.toUpperCase()}] ${epic.title} (${epic.epicId})`);
        });
      }
      
      if (openaiInsights.riskAssessment && openaiInsights.riskAssessment.length > 0) {
        console.log('\n⚠️ Key Risks:');
        openaiInsights.riskAssessment.slice(0, 3).forEach((risk, index) => {
          console.log(`${index + 1}. [${risk.impact.toUpperCase()}] ${risk.risk}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error analyzing workflow:', error);
      throw error;
    }
  }

  async listBoards(): Promise<any> {
    try {
      console.log('📋 Fetching available Miro boards...');
      const boardsResponse = await this.workflowAnalyzer.getMiroClient().listBoards(20);
      
      if (boardsResponse.data.length === 0) {
        console.log('No boards found in your Miro account');
        return [];
      }
      
      console.log('\n📊 Available Boards:');
      console.log('==================');
      
      boardsResponse.data.forEach((board, index) => {
        console.log(`${index + 1}. ${board.name}`);
        console.log(`   ID: ${board.id}`);
        console.log(`   Modified: ${new Date(board.modifiedAt).toLocaleDateString()}`);
        if (board.description) {
          console.log(`   Description: ${board.description}`);
        }
        console.log('');
      });
      
      return boardsResponse.data;
      
    } catch (error) {
      console.error('❌ Error fetching boards:', error);
      throw error;
    }
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
      console.log(`
🔍 Miro Workflow Analyzer

Usage:
  npm run analyze <project-id> [board-id] [output-dir]  - Analyze with project ID
  npm run analyze list <project-id>                      - List boards for project
  npm run analyze help                                   - Show this help

Examples:
  npm run analyze 286882 uXjVJXqJT1w= ./reports
  npm run analyze 286882 uXjVJXqJT1w=
  npm run analyze list 286882
      `);
      return;
    }

    switch (command.toLowerCase()) {
      case 'list':
        const listProjectId = args[1];
        if (!listProjectId) {
          console.log('❌ Please provide project ID: npm run analyze list <project-id>');
          return;
        }
        const listApp = new MiroWorkflowAnalyzerApp(listProjectId);
        await listApp.listBoards();
        break;
      
      case 'help':
        console.log(`
🔍 Miro Workflow Analyzer

This tool analyzes Miro boards to extract detailed workflow information using AI.

Commands:
  analyze <project-id> [board-id] [output-dir]  - Analyze specific board for project
  list <project-id>                            - List all available boards for project
  help                                         - Show this help message

Environment Variables Required:
  MIRO_ACCESS_TOKEN       - Your Miro API access token
  OPENAI_API_KEY          - Your OpenAI API key
  TARGET_API_BASE_URL     - Base URL for your target application API
  TARGET_API_ACCESS_TOKEN - Access token for your target application

Output:
  - Raw workflow data (JSON)
  - Formatted analysis report (Markdown)
  - Console summary with key insights
  - Work items created in TargetProcess
        `);
        break;
      
      default:
        // First arg is project ID, second is board ID
        const projectId = command;
        const boardId = args[1] || 'uXjVJXqJT1w='; // Default board ID
        const outputDir = args[2];
        
        console.log(`🚀 Starting analysis for project ${projectId}, board ${boardId}`);
        const app = new MiroWorkflowAnalyzerApp(projectId);
        await app.analyzeBoardWorkflow(boardId, outputDir);
        break;
    }
    
  } catch (error) {
    console.error('❌ Application error:', error);
    process.exit(1);
  }
}

// Run main function when this file is executed directly
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});