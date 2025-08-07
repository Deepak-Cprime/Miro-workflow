import OpenAI from 'openai';
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

export class OpenAIAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async analyzeWorkflow(workflowData: WorkflowAnalysis): Promise<OpenAIWorkflowInsights> {
    try {
      const prompt = this.buildAnalysisPrompt(workflowData);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 4000
      });

      const text = completion.choices[0]?.message?.content || '';
      // Parse the structured response
      return this.parseOpenAIResponse(text);
    } catch (error) {
      console.error('Error analyzing workflow with OpenAI:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(workflowData: WorkflowAnalysis): string {
    const nodesDescription = workflowData.nodes.map(node => 
      `- Node ${node.id}: "${node.title}" (Type: ${node.type})`
    ).join('\n');

    return `
You are an expert Product Owner analyzing a Miro workflow. Extract and structure the key deliverables from this workflow into epics, features, user stories, and tasks with their titles.

## Board Information
- Board Name: ${workflowData.boardInfo.name}
- Description: ${workflowData.boardInfo.description || 'No description provided'}

## Workflow Nodes (${workflowData.nodes.length} total):
${nodesDescription}

## Analysis Request
Extract the titles of epics, features, user stories, and tasks (if needed) from this Miro board workflow. Provide your analysis in the following simplified JSON format:

\`\`\`json
{
  "workflowSummary": "Brief summary of the workflow",
  "epics": [
    {
      "epicId": "EPIC-001",
      "title": "Epic title extracted from the board",
      "description": "Brief description of the epic",
      "businessValue": "Business value statement",
      "acceptanceCriteria": ["Key acceptance criteria"],
      "estimatedEffort": "T-shirt size (XS, S, M, L, XL)",
      "priority": "high|medium|low"
    }
  ],
  "features": [
    {
      "featureId": "FEAT-001",
      "epicId": "EPIC-001",
      "title": "Feature title from the board",
      "description": "Feature description",
      "userStories": [
        {
          "storyId": "US-001",
          "title": "User story title",
          "asA": "As a [user type]",
          "iWant": "I want [functionality]",
          "soThat": "So that [business benefit]",
          "acceptanceCriteria": ["Acceptance criteria"],
          "tasks": [
            {
              "taskId": "TASK-001",
              "title": "Task title",
              "description": "Task description",
              "estimatedHours": 8
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

Focus on:
1. Extracting titles directly from the Miro board nodes
2. Creating clear, concise titles for epics, features, and user stories
3. Including tasks only when they are clearly identifiable from the board
4. Maintaining the hierarchy: Epic → Feature → User Story → Task
`;
  }

  private parseOpenAIResponse(response: string): OpenAIWorkflowInsights {
    try {
      // Extract JSON from response (handle cases where there might be additional text)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in OpenAI response');
      }

      const jsonString = jsonMatch[1];
      const parsedResponse = JSON.parse(jsonString);

      // Validate and ensure all required fields are present
      return {
        workflowSummary: parsedResponse.workflowSummary || 'No summary provided',
        epics: parsedResponse.epics || [],
        features: parsedResponse.features || [],
        targetProcessImplementation: parsedResponse.targetProcessImplementation || {
          processName: 'Unknown process',
          targetSystem: 'Not specified',
          implementationApproach: 'Not specified',
          keyStakeholders: [],
          successMetrics: []
        },
        businessValue: parsedResponse.businessValue || 'Business value not specified',
        estimatedTimeToMarket: parsedResponse.estimatedTimeToMarket,
        riskAssessment: parsedResponse.riskAssessment || []
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      
      // Fallback: create a basic analysis from the raw response
      return {
        workflowSummary: 'Analysis completed but response formatting was invalid',
        epics: [],
        features: [],
        targetProcessImplementation: {
          processName: 'Unknown process',
          targetSystem: 'Not specified',
          implementationApproach: 'Manual review required due to parsing error',
          keyStakeholders: [],
          successMetrics: []
        },
        businessValue: 'Unable to determine from malformed response',
        riskAssessment: [{
          risk: 'Response parsing failed',
          impact: 'medium' as const,
          mitigation: 'Review the workflow manually for detailed analysis'
        }]
      };
    }
  }

  async generateWorkflowReport(workflowData: WorkflowAnalysis, openaiInsights: OpenAIWorkflowInsights): Promise<string> {
    const reportPrompt = `
Create a clean report focusing on the extracted epics, features, user stories, and tasks from the Miro board:

Board: ${workflowData.boardInfo.name}
Workflow Nodes: ${workflowData.nodes.length}

Product Owner Analysis:
${JSON.stringify(openaiInsights, null, 2)}

Please create a well-formatted markdown report that includes:
1. Summary of extracted items
2. Epic Titles and Brief Descriptions
3. Feature Titles grouped by Epic
4. User Story Titles grouped by Feature
5. Task Titles (if any) grouped by User Story

Keep it simple and focused on the titles and hierarchy extracted from the board.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: reportPrompt
        }],
        temperature: 0.7,
        max_tokens: 4000
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating workflow report:', error);
      
      // Fallback: create a basic report
      return this.createFallbackReport(workflowData, openaiInsights);
    }
  }

  private createFallbackReport(workflowData: WorkflowAnalysis, insights: OpenAIWorkflowInsights): string {
    return `
# Miro Board Analysis Report

## Board: ${workflowData.boardInfo.name}

### Summary
${insights.workflowSummary}

### Epics
${insights.epics.length > 0
  ? insights.epics.map(epic => 
      `#### ${epic.title} (${epic.epicId})\n${epic.description}`
    ).join('\n\n')
  : 'No epics identified'
}

### Features and User Stories
${insights.features.length > 0
  ? insights.features.map(feature => 
      `#### ${feature.title} (${feature.featureId})\n${feature.description}\n\n**User Stories:**\n${
        feature.userStories.map(story => 
          `- **${story.title}** (${story.storyId})\n  ${story.asA}, ${story.iWant} ${story.soThat}${story.tasks && story.tasks.length > 0 ? `\n  **Tasks:**\n${story.tasks.map(task => `    - ${task.title}`).join('\n')}` : ''}`
        ).join('\n\n')
      }`
    ).join('\n\n')
  : 'No features identified'
}
`;
  }
}