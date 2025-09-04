
import { MiroClient } from './miroClient.js';
import { MiroBoard, MiroItem, MiroConnector, MiroGroup, MiroTag, WorkflowNode, WorkflowConnection, WorkflowAnalysis } from '../types/miro.js';

export class WorkflowAnalyzer {
  private miroClient: MiroClient;

  constructor(miroAccessToken: string) {
    this.miroClient = new MiroClient(miroAccessToken);
  }

  getMiroClient(): MiroClient {
    return this.miroClient;
  }

  async analyzeBoardWorkflow(boardId: string): Promise<WorkflowAnalysis> {
    try {
      // Gather board information step by step with error handling
      console.log('Getting board info...');
      const boardInfo = await this.miroClient.getSpecificBoard(boardId);
      
      console.log('Getting board items...');
      // Get items with pagination support
      let allItems: MiroItem[] = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;
      
      while (hasMore) {
        const itemsResponse = await this.miroClient.getItemsOnBoard(boardId, limit, offset);
        allItems = allItems.concat(itemsResponse.data);
        
        // Check if there are more items to fetch
        hasMore = itemsResponse.data.length === limit;
        offset += limit;
        
        // Safety limit to prevent infinite loops
        if (offset >= 500) break;
      }
      
      console.log(`Fetched ${allItems.length} items from board`);
      const itemsResponse = { data: allItems };
      
      console.log('Getting connectors...');
      let connectorsResponse: { data: MiroConnector[] } = { data: [] };
      try {
        connectorsResponse = await this.miroClient.getConnectors(boardId, 50); // Reduce limit
      } catch (error) {
        console.warn('Could not fetch connectors:', error instanceof Error ? error.message : String(error));
        connectorsResponse = { data: [] };
      }
      
      console.log('Getting groups...');
      let groupsResponse: { data: MiroGroup[] } = { data: [] };
      try {
        groupsResponse = await this.miroClient.getAllGroups(boardId, 50);
      } catch (error) {
        console.warn('Could not fetch groups:', error instanceof Error ? error.message : String(error));
        groupsResponse = { data: [] };
      }
      
      console.log('Getting tags...');
      let tagsResponse: { data: MiroTag[] } = { data: [] };
      try {
        tagsResponse = await this.miroClient.getAllTags(boardId);
      } catch (error) {
        console.warn('Could not fetch tags:', error instanceof Error ? error.message : String(error));
        tagsResponse = { data: [] };
      }

      const items = itemsResponse.data;
      const connectors = connectorsResponse.data;
      const groups = groupsResponse.data;
      const tags = tagsResponse.data;

      // Build workflow nodes from items
      const workflowNodes = await this.buildWorkflowNodes(boardId, items, connectors);
      
      // Build workflow connections
      const workflowConnections = this.buildWorkflowConnections(connectors);
      
      // Analyze groups
      const workflowGroups = await this.analyzeGroups(boardId, groups);
      
      // Generate insights
      const insights = this.generateWorkflowInsights(workflowNodes, workflowConnections);

      return {
        boardInfo: {
          id: boardInfo.id,
          name: boardInfo.name,
          description: boardInfo.description
        },
        nodes: workflowNodes,
        connections: workflowConnections,
        groups: workflowGroups,
        tags: tags,
        insights
      };

    } catch (error) {
      console.error('Error analyzing board workflow:', error);
      throw error;
    }
  }

  private async buildWorkflowNodes(boardId: string, items: MiroItem[], connectors: MiroConnector[]): Promise<WorkflowNode[]> {
    const nodes: WorkflowNode[] = [];

    for (const item of items) {
      // Skip connectors as they are handled separately
      if (item.type === 'connector') continue;

      // Get item tags
      let itemTags: string[] = [];
      try {
        const tagsResponse = await this.miroClient.getItemTags(boardId, item.id);
        itemTags = tagsResponse.data.map(tag => tag.title);
      } catch (error) {
        // Tags might not be available for all items
        itemTags = [];
      }

      // Find connections for this item
      const incomingConnections = connectors
        .filter(conn => conn && conn.endItem && conn.endItem.id === item.id)
        .map(conn => conn.id);
      
      const outgoingConnections = connectors
        .filter(conn => conn && conn.startItem && conn.startItem.id === item.id)
        .map(conn => conn.id);

      // Extract title and description based on item type
      const { title, description } = this.extractItemContent(item);

      nodes.push({
        id: item.id,
        type: item.type,
        title,
        description,
        position: {
          x: item.position?.x || item.geometry?.x || 0,
          y: item.position?.y || item.geometry?.y || 0
        },
        connections: {
          incoming: incomingConnections,
          outgoing: outgoingConnections
        },
        tags: itemTags,
        metadata: {
          createdAt: item.createdAt,
          modifiedAt: item.modifiedAt,
          createdBy: item.createdBy,
          modifiedBy: item.modifiedBy,
          style: item.style,
          geometry: item.geometry
        }
      });
    }

    return nodes;
  }

  private buildWorkflowConnections(connectors: MiroConnector[]): WorkflowConnection[] {
    return connectors
      .filter(connector => connector && connector.startItem && connector.endItem)
      .map(connector => ({
        id: connector.id,
        from: connector.startItem.id,
        to: connector.endItem.id,
        label: connector.captions?.[0]?.content || undefined,
        type: 'connector'
      }));
  }

  private async analyzeGroups(boardId: string, groups: MiroGroup[]): Promise<Array<{ id: string; name?: string; nodeIds: string[] }>> {
    const workflowGroups = [];

    for (const group of groups) {
      try {
        const groupItemsResponse = await this.miroClient.getGroupItems(boardId, group.id);
        const nodeIds = groupItemsResponse.data.map(item => item.id);
        
        workflowGroups.push({
          id: group.id,
          name: undefined, // Groups might not have explicit names
          nodeIds
        });
      } catch (error) {
        console.warn(`Could not get items for group ${group.id}:`, error);
      }
    }

    return workflowGroups;
  }

  private extractItemContent(item: MiroItem): { title: string; description?: string } {
    let title = `${item.type} ${item.id}`;
    let description: string | undefined;

    // Extract content based on item type
    switch (item.type) {
      case 'sticky_note':
        title = item.data?.content || item.data?.text || title;
        break;
      case 'text':
        title = item.data?.content || item.data?.text || title;
        break;
      case 'card':
        title = item.data?.title || title;
        description = item.data?.description;
        break;
      case 'app_card':
        title = item.data?.title || title;
        description = item.data?.description;
        break;
      case 'shape':
        title = item.data?.content || item.data?.text || title;
        break;
      case 'frame':
        title = item.data?.title || title;
        break;
      case 'document':
        title = item.data?.title || title;
        break;
      case 'mindmap_node':
        title = item.data?.content || title;
        break;
      case 'image':
        title = item.data?.title || `Image ${item.id}`;
        break;
      case 'embed':
        title = item.data?.title || item.data?.url || title;
        break;
      default:
        // Try to extract any text content
        if (item.data?.content) title = item.data.content;
        else if (item.data?.text) title = item.data.text;
        else if (item.data?.title) title = item.data.title;
    }

    return { title: title.slice(0, 100), description }; // Limit title length
  }

  private generateWorkflowInsights(nodes: WorkflowNode[], connections: WorkflowConnection[]): any {
    // Find entry points (nodes with no incoming connections)
    const entryPoints = nodes
      .filter(node => node.connections.incoming.length === 0)
      .map(node => node.id);

    // Find exit points (nodes with no outgoing connections)
    const exitPoints = nodes
      .filter(node => node.connections.outgoing.length === 0)
      .map(node => node.id);

    // Find potential bottlenecks (nodes with many incoming connections)
    const bottlenecks = nodes
      .filter(node => node.connections.incoming.length > 2)
      .map(node => node.id);

    return {
      totalSteps: nodes.length,
      entryPoints,
      exitPoints,
      bottlenecks,
      recommendations: this.generateRecommendations(nodes, connections)
    };
  }

  private generateRecommendations(nodes: WorkflowNode[], connections: WorkflowConnection[]): string[] {
    const recommendations: string[] = [];

    // Check for disconnected nodes
    const connectedNodeIds = new Set([
      ...connections.map(c => c.from),
      ...connections.map(c => c.to)
    ]);
    const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    
    if (disconnectedNodes.length > 0) {
      recommendations.push(`Found ${disconnectedNodes.length} disconnected nodes that might need connections`);
    }

    // Check for multiple entry points
    const entryPoints = nodes.filter(node => node.connections.incoming.length === 0);
    if (entryPoints.length > 3) {
      recommendations.push(`Consider consolidating ${entryPoints.length} entry points for clearer workflow start`);
    }

    // Check for multiple exit points
    const exitPoints = nodes.filter(node => node.connections.outgoing.length === 0);
    if (exitPoints.length > 3) {
      recommendations.push(`Consider consolidating ${exitPoints.length} exit points for clearer workflow end`);
    }

    return recommendations;
  }
}