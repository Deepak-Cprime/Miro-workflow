import axios from 'axios';
export class WorkItemCreator {
    apiClient;
    projectId;
    constructor(baseUrl, accessToken, projectId) {
        this.projectId = projectId;
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
    async createWorkItems(insights) {
        const results = {
            epic: { success: false, name: '' },
            features: [],
            userStories: []
        };
        try {
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
                                }
                                else {
                                    console.error(`❌ Failed to create User Story "${userStory.title}": ${storyResult.error}`);
                                }
                            }
                        }
                        else {
                            console.error(`❌ Failed to create Feature "${feature.title}": ${featureResult.error}`);
                        }
                    }
                }
                else {
                    console.error(`❌ Failed to create Epic "${epic.title}": ${epicResult.error}`);
                }
            }
            else {
                console.log('⚠️ No epics found in analysis');
            }
        }
        catch (error) {
            console.error('❌ Error in work item creation process:', error);
        }
        return results;
    }
    async createEpic(epic) {
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
        }
        catch (error) {
            console.error('Error creating epic:', error.response?.data || error.message);
            return {
                success: false,
                name: epic.title,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async createFeature(feature, epicId) {
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
            let featureId;
            if (typeof response.data === 'string') {
                // Parse XML response to get ID
                const idMatch = response.data.match(/Id="(\d+)"/);
                featureId = idMatch ? parseInt(idMatch[1]) : 0;
            }
            else {
                featureId = response.data.Id;
            }
            return {
                success: true,
                id: featureId,
                name: feature.title
            };
        }
        catch (error) {
            console.error('Error creating feature:', error.response?.data || error.message);
            return {
                success: false,
                name: feature.title,
                error: error.response?.data?.message || error.message
            };
        }
    }
    async createUserStory(userStory, featureId) {
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
            let storyId;
            if (typeof response.data === 'string') {
                // Parse XML response to get ID
                const idMatch = response.data.match(/Id="(\d+)"/);
                storyId = idMatch ? parseInt(idMatch[1]) : 0;
            }
            else {
                storyId = response.data.Id;
            }
            return {
                success: true,
                id: storyId,
                name: userStory.title
            };
        }
        catch (error) {
            console.error('Error creating user story:', error.response?.data || error.message);
            return {
                success: false,
                name: userStory.title,
                error: error.response?.data?.message || error.message
            };
        }
    }
}
