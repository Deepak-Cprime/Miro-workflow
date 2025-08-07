export interface MiroBoard {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    modifiedAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    team: {
        id: string;
        name: string;
    };
    currentUserPermission: {
        role: string;
    };
}
export interface MiroItem {
    id: string;
    type: string;
    data: any;
    style: any;
    geometry: {
        x: number;
        y: number;
        width?: number;
        height?: number;
    };
    position: {
        x: number;
        y: number;
        origin: string;
    };
    parent?: {
        id: string;
    };
    connectorIds?: string[];
    createdAt: string;
    modifiedAt: string;
    createdBy: {
        id: string;
        name: string;
    };
    modifiedBy: {
        id: string;
        name: string;
    };
}
export interface MiroConnector {
    id: string;
    type: 'connector';
    startItem: {
        id: string;
        snapTo?: string;
    };
    endItem: {
        id: string;
        snapTo?: string;
    };
    style: {
        strokeColor?: string;
        strokeWidth?: number;
        strokeStyle?: string;
        textOrientation?: string;
    };
    captions?: Array<{
        content: string;
        position: number;
    }>;
    createdAt: string;
    modifiedAt: string;
}
export interface MiroGroup {
    id: string;
    type: 'group';
    childrenIds: string[];
    style: any;
    geometry: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export interface MiroTag {
    id: string;
    title: string;
    fillColor: string;
    createdAt: string;
    modifiedAt: string;
}
export interface WorkflowNode {
    id: string;
    type: string;
    title: string;
    description?: string;
    position: {
        x: number;
        y: number;
    };
    connections: {
        incoming: string[];
        outgoing: string[];
    };
    tags: string[];
    metadata: any;
}
export interface WorkflowConnection {
    id: string;
    from: string;
    to: string;
    label?: string;
    type?: string;
}
export interface WorkflowAnalysis {
    boardInfo: {
        id: string;
        name: string;
        description?: string;
    };
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    groups: Array<{
        id: string;
        name?: string;
        nodeIds: string[];
    }>;
    tags: MiroTag[];
    insights: {
        totalSteps: number;
        entryPoints: string[];
        exitPoints: string[];
        criticalPath?: string[];
        bottlenecks?: string[];
        recommendations?: string[];
    };
}
