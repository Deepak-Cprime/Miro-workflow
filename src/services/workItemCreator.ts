import axios, { AxiosInstance } from 'axios';
import { OpenAIWorkflowInsights } from './openaiAnalyzer.js';

export interface WorkItemResult {
  success: boolean;
  id?: number;
  name: string;
  error?: string;
}

export interface WorkItemCreationResults {
  epic: WorkItemResult;
  features: WorkItemResult[];
  userStories: WorkItemResult[];
}

export class WorkItemCreator {
  private apiClient: AxiosInstance;
  private projectId: number;

  constructor(baseUrl: string, accessToken: string, projectId?: number) {
    this.projectId = projectId || 0;
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Adjust auth header format as needed
      },
      params: {
        access_token: accessToken // Based on your response_format.txt
      }
    });
  }

  async createProject(workflowName: string): Promise<WorkItemResult> {
    try {
      const aiProjectName = `AI_Workflow_${workflowName.replace(/\s+/g, '_')}_Analysis`;
      
      const payload = {
        Name: aiProjectName
      };

      console.log('🚀 Creating Project with payload:', JSON.stringify(payload, null, 2));
      
      const response = await this.apiClient.post('/api/v1/Project/', payload);
      
      // Handle XML response - extract ID from XML
      let projectId: number;
      if (typeof response.data === 'string') {
        // Parse XML response to get ID
        const idMatch = response.data.match(/Id="(\d+)"/);
        projectId = idMatch ? parseInt(idMatch[1]) : 0;
      } else {
        projectId = response.data.Id;
      }
      
      // Set the project ID for future use
      this.projectId = projectId;
      
      return {
        success: true,
        id: projectId,
        name: aiProjectName
      };
    } catch (error: any) {
      console.error('Error creating project:', error.response?.data || error.message);
      return {
        success: false,
        name: `AI_Workflow_${workflowName.replace(/\s+/g, '_')}_Analysis`,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async createWorkItems(insights: OpenAIWorkflowInsights, workflowName?: string): Promise<WorkItemCreationResults> {
    const results: WorkItemCreationResults = {
      epic: { success: false, name: '' },
      features: [],
      userStories: []
    };

    try {
      // Step 0: Create Project if not already set
      if (this.projectId === 0) {
        console.log('🚀 No project ID set, creating new project...');
        const projectName = workflowName || 'Miro_Board_Analysis';
        const projectResult = await this.createProject(projectName);
        
        if (!projectResult.success) {
          console.error(`❌ Failed to create project: ${projectResult.error}`);
          return results;
        }
        
        console.log(`✅ Project "${projectResult.name}" created with ID: ${projectResult.id}`);
      }

      // Step 1: Create Epic
      console.log('📋 Creating Epic...');
      if (insights.epics.length > 0) {
        const epic = insights.epics[0]; // Take the first epic
        const epicResult = await this.createEpic(epic);
        results.epic = epicResult;
        
        if (epicResult.success && epicResult.id) {
          console.log(`✅ Epic created with ID: ${epicResult.id}`);
          
          // Step 2: Create Features
          console.log('⚡ Creating Features...');
          for (const feature of insights.features) {
            const featureResult = await this.createFeature(feature, epicResult.id);
            results.features.push(featureResult);
            
            if (featureResult.success && featureResult.id) {
              console.log(`✅ Feature "${feature.title}" created with ID: ${featureResult.id}`);
              
              // Step 3: Create User Stories for this feature
              console.log(`👥 Creating User Stories for feature "${feature.title}"...`);
              for (const userStory of feature.userStories) {
                const storyResult = await this.createUserStory(userStory, featureResult.id);
                results.userStories.push(storyResult);
                
                if (storyResult.success && storyResult.id) {
                  console.log(`✅ User Story "${userStory.title}" created with ID: ${storyResult.id}`);
                } else {
                  console.error(`❌ Failed to create User Story "${userStory.title}": ${storyResult.error}`);
                }
              }
            } else {
              console.error(`❌ Failed to create Feature "${feature.title}": ${featureResult.error}`);
            }
          }
        } else {
          console.error(`❌ Failed to create Epic "${epic.title}": ${epicResult.error}`);
        }
      } else {
        console.log('⚠️ No epics found in analysis');
      }

    } catch (error) {
      console.error('❌ Error in work item creation process:', error);
    }

    return results;
  }

  private async createEpic(epic: any): Promise<WorkItemResult> {
    try {
      const payload = {
        Name: epic.title,
        Description: epic.description,
        Project: { Id: this.projectId }
      };

      console.log('📋 Creating Epic with payload:', JSON.stringify(payload, null, 2));
      
      const response = await this.apiClient.post('/api/v1/Epic/', payload);
      
      return {
        success: true,
        id: response.data.Id,
        name: epic.title
      };
    } catch (error: any) {
      console.error('Error creating epic:', error.response?.data || error.message);
      return {
        success: false,
        name: epic.title,
        error: error.response?.data?.message || error.message
      };
    }
  }

  private async createFeature(feature: any, epicId: number): Promise<WorkItemResult> {
    try {
      const payload = {
        Name: feature.title,
        Description: feature.description,
        Epic: { Id: epicId },
        Project: { Id: this.projectId }
      };

      console.log('⚡ Creating Feature with payload:', JSON.stringify(payload, null, 2));
      
      const response = await this.apiClient.post('/api/v1/features/', payload);
      
      // Handle XML response - extract ID from XML
      let featureId: number;
      if (typeof response.data === 'string') {
        // Parse XML response to get ID
        const idMatch = response.data.match(/Id="(\d+)"/);
        featureId = idMatch ? parseInt(idMatch[1]) : 0;
      } else {
        featureId = response.data.Id;
      }
      
      return {
        success: true,
        id: featureId,
        name: feature.title
      };
    } catch (error: any) {
      console.error('Error creating feature:', error.response?.data || error.message);
      return {
        success: false,
        name: feature.title,
        error: error.response?.data?.message || error.message
      };
    }
  }

  private async createUserStory(userStory: any, featureId: number): Promise<WorkItemResult> {
    try {
      const payload = {
        Name: userStory.title,
        Description: userStory.asA + ', ' + userStory.iWant + ' ' + userStory.soThat,
        Feature: { Id: featureId },
        Project: { Id: this.projectId }
      };

      console.log('👥 Creating User Story with payload:', JSON.stringify(payload, null, 2));
      
      const response = await this.apiClient.post('/api/v1/UserStory/', payload);
      
      // Handle XML response - extract ID from XML
      let storyId: number;
      if (typeof response.data === 'string') {
        // Parse XML response to get ID
        const idMatch = response.data.match(/Id="(\d+)"/);
        storyId = idMatch ? parseInt(idMatch[1]) : 0;
      } else {
        storyId = response.data.Id;
      }
      
      return {
        success: true,
        id: storyId,
        name: userStory.title
      };
    } catch (error: any) {
      console.error('Error creating user story:', error.response?.data || error.message);
      return {
        success: false,
        name: userStory.title,
        error: error.response?.data?.message || error.message
      };
    }
  }
}