import { GoogleGenerativeAI } from '@google/generative-ai';
export class GeminiAnalyzer {
    genAI;
    model;
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    async analyzeWorkflow(workflowData) {
        try {
            const prompt = this.buildAnalysisPrompt(workflowData);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Parse the structured response
            return this.parseGeminiResponse(text);
        }
        catch (error) {
            console.error('Error analyzing workflow with Gemini:', error);
            throw error;
        }
    }
    buildAnalysisPrompt(workflowData) {
        const nodesDescription = workflowData.nodes.map(node => `- Node ${node.id}: "${node.title}" (Type: ${node.type}, Position: ${node.position.x},${node.position.y}, Incoming: ${node.connections.incoming.length}, Outgoing: ${node.connections.outgoing.length})`).join('\n');
        const connectionsDescription = workflowData.connections.map(conn => `- Connection ${conn.id}: From ${conn.from} to ${conn.to}${conn.label ? ` (Label: "${conn.label}")` : ''}`).join('\n');
        const groupsDescription = workflowData.groups.length > 0
            ? workflowData.groups.map(group => `- Group ${group.id}: Contains ${group.nodeIds.length} nodes${group.name ? ` (Name: "${group.name}")` : ''}`).join('\n')
            : 'No groups defined';
        const tagsDescription = workflowData.tags.length > 0
            ? workflowData.tags.map(tag => `- Tag: "${tag.title}"`).join('\n')
            : 'No tags defined';
        return `
You are an expert business process analyst. Analyze the following Miro board workflow and provide detailed insights.

## Board Information
- Board Name: ${workflowData.boardInfo.name}
- Board ID: ${workflowData.boardInfo.id}
- Description: ${workflowData.boardInfo.description || 'No description provided'}

## Workflow Nodes (${workflowData.nodes.length} total):
${nodesDescription}

## Workflow Connections (${workflowData.connections.length} total):
${connectionsDescription}

## Groups:
${groupsDescription}

## Tags:
${tagsDescription}

## Current Insights:
- Total Steps: ${workflowData.insights.totalSteps}
- Entry Points: ${workflowData.insights.entryPoints.join(', ')}
- Exit Points: ${workflowData.insights.exitPoints.join(', ')}
- Potential Bottlenecks: ${workflowData.insights.bottlenecks?.join(', ') || 'None identified'}

## Analysis Request
Please provide a comprehensive analysis in the following JSON format:

\`\`\`json
{
  "workflowSummary": "A concise 2-3 sentence summary of what this workflow accomplishes",
  "processSteps": [
    {
      "step": 1,
      "title": "Step name",
      "description": "What happens in this step",
      "type": "start|process|decision|end",
      "dependencies": ["list of node IDs this step depends on"]
    }
  ],
  "processFlow": "A narrative description of how the process flows from start to finish",
  "criticalPath": ["ordered list of node IDs representing the main process path"],
  "potentialIssues": [
    {
      "issue": "Description of the issue",
      "severity": "low|medium|high",
      "recommendation": "How to address this issue"
    }
  ],
  "optimizationSuggestions": [
    "List of specific suggestions to improve the workflow"
  ],
  "businessValue": "Description of the business value this process provides",
  "estimatedDuration": "Estimated time to complete this process",
  "resourceRequirements": ["List of resources needed to execute this workflow"]
}
\`\`\`

Focus on:
1. Understanding the logical flow between nodes
2. Identifying the main process path vs. alternative paths
3. Spotting potential inefficiencies or bottlenecks
4. Suggesting practical improvements
5. Assessing business impact and value
`;
    }
    parseGeminiResponse(response) {
        try {
            // Extract JSON from response (handle cases where there might be additional text)
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Gemini response');
            }
            const jsonString = jsonMatch[1];
            const parsedResponse = JSON.parse(jsonString);
            // Validate and ensure all required fields are present
            return {
                workflowSummary: parsedResponse.workflowSummary || 'No summary provided',
                processSteps: parsedResponse.processSteps || [],
                processFlow: parsedResponse.processFlow || 'No process flow description provided',
                criticalPath: parsedResponse.criticalPath || [],
                potentialIssues: parsedResponse.potentialIssues || [],
                optimizationSuggestions: parsedResponse.optimizationSuggestions || [],
                businessValue: parsedResponse.businessValue || 'Business value not specified',
                estimatedDuration: parsedResponse.estimatedDuration,
                resourceRequirements: parsedResponse.resourceRequirements
            };
        }
        catch (error) {
            console.error('Error parsing Gemini response:', error);
            // Fallback: create a basic analysis from the raw response
            return {
                workflowSummary: 'Analysis completed but response formatting was invalid',
                processSteps: [],
                processFlow: response.substring(0, 500) + '...', // Use part of raw response
                criticalPath: [],
                potentialIssues: [{
                        issue: 'Response parsing failed',
                        severity: 'medium',
                        recommendation: 'Review the workflow manually for detailed analysis'
                    }],
                optimizationSuggestions: ['Manual review recommended due to parsing issues'],
                businessValue: 'Unable to determine from malformed response'
            };
        }
    }
    async generateWorkflowReport(workflowData, geminiInsights) {
        const reportPrompt = `
Create a comprehensive workflow analysis report based on the following data:

Board: ${workflowData.boardInfo.name}
Nodes: ${workflowData.nodes.length}
Connections: ${workflowData.connections.length}

Gemini Analysis:
${JSON.stringify(geminiInsights, null, 2)}

Please create a well-formatted markdown report that includes:
1. Executive Summary
2. Workflow Overview
3. Process Steps Detail
4. Critical Path Analysis
5. Issues and Recommendations
6. Optimization Opportunities
7. Business Impact Assessment

Make it professional and actionable for business stakeholders.
`;
        try {
            const result = await this.model.generateContent(reportPrompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Error generating workflow report:', error);
            // Fallback: create a basic report
            return this.createFallbackReport(workflowData, geminiInsights);
        }
    }
    createFallbackReport(workflowData, insights) {
        return `
# Workflow Analysis Report

## Board: ${workflowData.boardInfo.name}

### Summary
${insights.workflowSummary}

### Process Overview
- **Total Steps**: ${workflowData.nodes.length}
- **Connections**: ${workflowData.connections.length}
- **Entry Points**: ${workflowData.insights.entryPoints.length}
- **Exit Points**: ${workflowData.insights.exitPoints.length}

### Process Flow
${insights.processFlow}

### Critical Path
${insights.criticalPath.length > 0
            ? insights.criticalPath.map(nodeId => `- ${nodeId}`).join('\n')
            : 'No critical path identified'}

### Issues Identified
${insights.potentialIssues.length > 0
            ? insights.potentialIssues.map(issue => `- **${issue.severity.toUpperCase()}**: ${issue.issue}\n  *Recommendation*: ${issue.recommendation}`).join('\n\n')
            : 'No issues identified'}

### Optimization Suggestions
${insights.optimizationSuggestions.length > 0
            ? insights.optimizationSuggestions.map(suggestion => `- ${suggestion}`).join('\n')
            : 'No optimization suggestions available'}

### Business Value
${insights.businessValue}

${insights.estimatedDuration ? `### Estimated Duration\n${insights.estimatedDuration}` : ''}

${insights.resourceRequirements ?
            `### Resource Requirements\n${insights.resourceRequirements.map(req => `- ${req}`).join('\n')}`
            : ''}
`;
    }
}
