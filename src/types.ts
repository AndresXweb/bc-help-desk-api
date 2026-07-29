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
    createdAt: string;
    resolution?: Resolution;
}

export interface ResolutionTimeSummary {
    averageHours: number | null;
    fastest: { ticketId: string; hours: number } | null;
    slowest: { ticketId: string; hours: number } | null;
}

export interface ProcessedReport {
    totalTickets: number;
    closedTickets: number;
    openTickets: number;
    categoryFilter: string | null;
    resolutionTime: ResolutionTimeSummary;
    resolutions: Resolution[];
}