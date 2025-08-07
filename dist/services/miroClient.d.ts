import { MiroBoard, MiroItem, MiroConnector, MiroGroup, MiroTag } from '../types/miro.js';
export declare class MiroClient {
    private api;
    private accessToken;
    constructor(accessToken: string);
    listBoards(limit?: number, offset?: number): Promise<{
        data: MiroBoard[];
    }>;
    getSpecificBoard(boardId: string): Promise<MiroBoard>;
    getBoardClassification(boardId: string): Promise<any>;
    getBoardContentLogs(boardId: string): Promise<any>;
    getItemsOnBoard(boardId: string, limit?: number, offset?: number): Promise<{
        data: MiroItem[];
    }>;
    getSpecificItem(boardId: string, itemId: string): Promise<MiroItem>;
    getCardItem(boardId: string, itemId: string): Promise<MiroItem>;
    getAppCardItem(boardId: string, itemId: string): Promise<MiroItem>;
    getStickyNoteItem(boardId: string, itemId: string): Promise<MiroItem>;
    getTextItem(boardId: string, itemId: string): Promise<MiroItem>;
    getImageItem(boardId: string, itemId: string): Promise<MiroItem>;
    getShapeItem(boardId: string, itemId: string): Promise<MiroItem>;
    getFrameItem(boardId: string, itemId: string): Promise<MiroItem>;
    getDocumentItem(boardId: string, itemId: string): Promise<MiroItem>;
    getEmbedItem(boardId: string, itemId: string): Promise<MiroItem>;
    getConnectors(boardId: string, limit?: number): Promise<{
        data: MiroConnector[];
    }>;
    getSpecificConnector(boardId: string, connectorId: string): Promise<MiroConnector>;
    getAllGroups(boardId: string, limit?: number): Promise<{
        data: MiroGroup[];
    }>;
    getGroup(boardId: string, groupId: string): Promise<MiroGroup>;
    getGroupItems(boardId: string, groupId: string): Promise<{
        data: MiroItem[];
    }>;
    getMindmapNodes(boardId: string, limit?: number): Promise<{
        data: MiroItem[];
    }>;
    getMindmapNode(boardId: string, nodeId: string): Promise<MiroItem>;
    getAllTags(boardId: string): Promise<{
        data: MiroTag[];
    }>;
    getTag(boardId: string, tagId: string): Promise<MiroTag>;
    getItemTags(boardId: string, itemId: string): Promise<{
        data: MiroTag[];
    }>;
    getAllBoardMembers(boardId: string): Promise<any>;
    getSpecificBoardMember(boardId: string, memberId: string): Promise<any>;
    getOrganizationInfo(): Promise<any>;
    getOrganizationMembers(): Promise<any>;
    getOrganizationMember(memberId: string): Promise<any>;
}
