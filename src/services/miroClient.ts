import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MiroBoard, MiroItem, MiroConnector, MiroGroup, MiroTag } from '../types/miro.js';

export class MiroClient {
  private api: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.api = axios.create({
      baseURL: 'https://api.miro.com/v2',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Board Information Tools
  async listBoards(limit: number = 50, offset: number = 0): Promise<{ data: MiroBoard[] }> {
    const response: AxiosResponse = await this.api.get('/boards', {
      params: { limit, offset }
    });
    return response.data;
  }

  async getSpecificBoard(boardId: string): Promise<MiroBoard> {
    const encodedBoardId = encodeURIComponent(boardId);
    const response: AxiosResponse = await this.api.get(`/boards/${encodedBoardId}`);
    return response.data;
  }

  async getBoardClassification(boardId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/classification`);
    return response.data;
  }

  async getBoardContentLogs(boardId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/content-logs`);
    return response.data;
  }

  // Board Items/Content Tools
  async getItemsOnBoard(boardId: string, limit: number = 50, offset: number = 0): Promise<{ data: MiroItem[] }> {
    const encodedBoardId = encodeURIComponent(boardId);
    const response: AxiosResponse = await this.api.get(`/boards/${encodedBoardId}/items`, {
      params: { limit, offset }
    });
    return response.data;
  }

  async getSpecificItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/items/${itemId}`);
    return response.data;
  }

  // Specific Item Type Tools
  async getCardItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/cards/${itemId}`);
    return response.data;
  }

  async getAppCardItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/app_cards/${itemId}`);
    return response.data;
  }

  async getStickyNoteItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/sticky_notes/${itemId}`);
    return response.data;
  }

  async getTextItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/texts/${itemId}`);
    return response.data;
  }

  async getImageItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/images/${itemId}`);
    return response.data;
  }

  async getShapeItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/shapes/${itemId}`);
    return response.data;
  }

  async getFrameItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/frames/${itemId}`);
    return response.data;
  }

  async getDocumentItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/documents/${itemId}`);
    return response.data;
  }

  async getEmbedItem(boardId: string, itemId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/embeds/${itemId}`);
    return response.data;
  }

  // Connection & Organization Tools
  async getConnectors(boardId: string, limit: number = 50): Promise<{ data: MiroConnector[] }> {
    const encodedBoardId = encodeURIComponent(boardId);
    const response: AxiosResponse = await this.api.get(`/boards/${encodedBoardId}/connectors`, {
      params: { limit }
    });
    return response.data;
  }

  async getSpecificConnector(boardId: string, connectorId: string): Promise<MiroConnector> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/connectors/${connectorId}`);
    return response.data;
  }

  async getAllGroups(boardId: string, limit: number = 50): Promise<{ data: MiroGroup[] }> {
    const encodedBoardId = encodeURIComponent(boardId);
    const response: AxiosResponse = await this.api.get(`/boards/${encodedBoardId}/groups`, {
      params: { limit }
    });
    return response.data;
  }

  async getGroup(boardId: string, groupId: string): Promise<MiroGroup> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/groups/${groupId}`);
    return response.data;
  }

  async getGroupItems(boardId: string, groupId: string): Promise<{ data: MiroItem[] }> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/groups/${groupId}/items`);
    return response.data;
  }

  async getMindmapNodes(boardId: string, limit: number = 50): Promise<{ data: MiroItem[] }> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/mindmap_nodes`, {
      params: { limit }
    });
    return response.data;
  }

  async getMindmapNode(boardId: string, nodeId: string): Promise<MiroItem> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/mindmap_nodes/${nodeId}`);
    return response.data;
  }

  // Tagging & Metadata Tools
  async getAllTags(boardId: string): Promise<{ data: MiroTag[] }> {
    const encodedBoardId = encodeURIComponent(boardId);
    const response: AxiosResponse = await this.api.get(`/boards/${encodedBoardId}/tags`);
    return response.data;
  }

  async getTag(boardId: string, tagId: string): Promise<MiroTag> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/tags/${tagId}`);
    return response.data;
  }

  async getItemTags(boardId: string, itemId: string): Promise<{ data: MiroTag[] }> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/items/${itemId}/tags`);
    return response.data;
  }

  // Board Management Tools
  async getAllBoardMembers(boardId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/members`);
    return response.data;
  }

  async getSpecificBoardMember(boardId: string, memberId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/boards/${boardId}/members/${memberId}`);
    return response.data;
  }

  // Organization Tools
  async getOrganizationInfo(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/orgs/me');
    return response.data;
  }

  async getOrganizationMembers(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/orgs/me/members');
    return response.data;
  }

  async getOrganizationMember(memberId: string): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/orgs/me/members/${memberId}`);
    return response.data;
  }
}