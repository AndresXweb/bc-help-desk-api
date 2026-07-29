export interface Agent {
    id: string;
    name: string;
    level: number;
}

export interface Category {
    id: string;
    name: string;
}

export interface Resolution {
    id: string;
    description: string;
    resolvedAt: string;
}

export interface Ticket {
    id: string;
    title: string;
    status: 'open' | 'in_progress' | 'closed';
    agentId: string;
    categoryId: string;
    resolution?: Resolution;
}

export interface ProcessedReport {
    totalTickets: number;
    closedTickets: number;
    openTickets: number;
    resolutions: Resolution[];
}