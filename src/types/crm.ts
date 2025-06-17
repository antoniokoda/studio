export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  financialData?: {
    annualRevenue?: number;
    contractValue?: number;
  };
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export type OpportunityStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Opportunity {
  id: string;
  name: string;
  clientId: string; 
  clientName?: string; // Denormalized for display
  stage: OpportunityStage;
  value: number;
  closeDate: string; // ISO Date string
  description?: string;
  assignedTo: string; // User ID
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface Call {
  id: string;
  opportunityId: string; 
  opportunityName?: string; // Denormalized for display
  dateTime: string; // ISO Date string
  summary: string;
  participants: string[]; 
  recordingUrl?: string;
  notes?: string; 
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskType = 'Task' | 'Notification' | 'Call Reminder';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO Date string
  status: TaskStatus;
  relatedOpportunityId?: string;
  relatedOpportunityName?: string; // Denormalized for display
  assignedTo: string; // User ID
  description?: string;
  type: TaskType;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

// Sample data for demonstration
export const sampleClients: Client[] = [
  { id: '1', name: 'Innovate Corp', email: 'contact@innovate.com', phone: '555-0101', company: 'Innovate Corp', address: '123 Tech Park', financialData: { annualRevenue: 5000000, contractValue: 50000 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Synergy Solutions', email: 'info@synergy.com', phone: '555-0102', company: 'Synergy Solutions', address: '456 Business Hub', financialData: { annualRevenue: 10000000, contractValue: 120000 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const sampleOpportunities: Opportunity[] = [
  { id: 'opp1', name: 'Innovate Upgrade Project', clientId: '1', clientName: 'Innovate Corp', stage: 'Proposal', value: 25000, closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: "Upgrade Innovate Corp's existing system with new modules." },
  { id: 'opp2', name: 'Synergy Full Suite', clientId: '2', clientName: 'Synergy Solutions', stage: 'Qualification', value: 75000, closeDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: "Provide Synergy Solutions with the complete Visionarius CRM suite." },
];

export const sampleCalls: Call[] = [
  { id: 'call1', opportunityId: 'opp1', opportunityName: 'Innovate Upgrade Project', dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), summary: 'Discussed upgrade requirements.', participants: ['Sales Rep', 'Innovate CTO'], notes: 'Client is interested in AI features. Needs a follow-up demo next week.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const sampleTasks: Task[] = [
  { id: 'task1', title: 'Prepare Innovate Proposal', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'In Progress', relatedOpportunityId: 'opp1', relatedOpportunityName: 'Innovate Upgrade Project', assignedTo: 'user1', type: 'Task', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task2', title: 'Follow up with Synergy', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pending', relatedOpportunityId: 'opp2', relatedOpportunityName: 'Synergy Full Suite', assignedTo: 'user1', type: 'Call Reminder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];
