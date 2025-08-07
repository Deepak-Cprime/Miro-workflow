import axios from 'axios';
export class MiroClient {
    api;
    accessToken;
    constructor(accessToken) {
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
    async listBoards(limit = 50, offset = 0) {
        const response = await this.api.get('/boards', {
            params: { limit, offset }
        });
        return response.data;
    }
    async getSpecificBoard(boardId) {
        const encodedBoardId = encodeURIComponent(boardId);
        const response = await this.api.get(`/boards/${encodedBoardId}`);
        return response.data;
    }
    async getBoardClassification(boardId) {
        const response = await this.api.get(`/boards/${boardId}/classification`);
        return response.data;
    }
    async getBoardContentLogs(boardId) {
        const response = await this.api.get(`/boards/${boardId}/content-logs`);
        return response.data;
    }
    // Board Items/Content Tools
    async getItemsOnBoard(boardId, limit = 50, offset = 0) {
        const encodedBoardId = encodeURIComponent(boardId);
        const response = await this.api.get(`/boards/${encodedBoardId}/items`, {
            params: { limit, offset }
        });
        return response.data;
    }
    async getSpecificItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/items/${itemId}`);
        return response.data;
    }
    // Specific Item Type Tools
    async getCardItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/cards/${itemId}`);
        return response.data;
    }
    async getAppCardItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/app_cards/${itemId}`);
        return response.data;
    }
    async getStickyNoteItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/sticky_notes/${itemId}`);
        return response.data;
    }
    async getTextItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/texts/${itemId}`);
        return response.data;
    }
    async getImageItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/images/${itemId}`);
        return response.data;
    }
    async getShapeItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/shapes/${itemId}`);
        return response.data;
    }
    async getFrameItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/frames/${itemId}`);
        return response.data;
    }
    async getDocumentItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/documents/${itemId}`);
        return response.data;
    }
    async getEmbedItem(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/embeds/${itemId}`);
        return response.data;
    }
    // Connection & Organization Tools
    async getConnectors(boardId, limit = 50) {
        const encodedBoardId = encodeURIComponent(boardId);
        const response = await this.api.get(`/boards/${encodedBoardId}/connectors`, {
            params: { limit }
        });
        return response.data;
    }
    async getSpecificConnector(boardId, connectorId) {
        const response = await this.api.get(`/boards/${boardId}/connectors/${connectorId}`);
        return response.data;
    }
    async getAllGroups(boardId, limit = 50) {
        const encodedBoardId = encodeURIComponent(boardId);
        const response = await this.api.get(`/boards/${encodedBoardId}/groups`, {
            params: { limit }
        });
        return response.data;
    }
    async getGroup(boardId, groupId) {
        const response = await this.api.get(`/boards/${boardId}/groups/${groupId}`);
        return response.data;
    }
    async getGroupItems(boardId, groupId) {
        const response = await this.api.get(`/boards/${boardId}/groups/${groupId}/items`);
        return response.data;
    }
    async getMindmapNodes(boardId, limit = 50) {
        const response = await this.api.get(`/boards/${boardId}/mindmap_nodes`, {
            params: { limit }
        });
        return response.data;
    }
    async getMindmapNode(boardId, nodeId) {
        const response = await this.api.get(`/boards/${boardId}/mindmap_nodes/${nodeId}`);
        return response.data;
    }
    // Tagging & Metadata Tools
    async getAllTags(boardId) {
        const encodedBoardId = encodeURIComponent(boardId);
        const response = await this.api.get(`/boards/${encodedBoardId}/tags`);
        return response.data;
    }
    async getTag(boardId, tagId) {
        const response = await this.api.get(`/boards/${boardId}/tags/${tagId}`);
        return response.data;
    }
    async getItemTags(boardId, itemId) {
        const response = await this.api.get(`/boards/${boardId}/items/${itemId}/tags`);
        return response.data;
    }
    // Board Management Tools
    async getAllBoardMembers(boardId) {
        const response = await this.api.get(`/boards/${boardId}/members`);
        return response.data;
    }
    async getSpecificBoardMember(boardId, memberId) {
        const response = await this.api.get(`/boards/${boardId}/members/${memberId}`);
        return response.data;
    }
    // Organization Tools
    async getOrganizationInfo() {
        const response = await this.api.get('/orgs/me');
        return response.data;
    }
    async getOrganizationMembers() {
        const response = await this.api.get('/orgs/me/members');
        return response.data;
    }
    async getOrganizationMember(memberId) {
        const response = await this.api.get(`/orgs/me/members/${memberId}`);
        return response.data;
    }
}
