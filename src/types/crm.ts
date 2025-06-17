
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

// New types for configurable processes and stages
export interface Process {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  processId: string;
  name: string;
  order: number; // For ordering stages within a process
}

export type OpportunityStatus = 'Activa' | 'Ganada' | 'Perdida';
export type OpportunityProposalStatus = 'N/A' | 'Creada' | 'Presentada';

export interface Opportunity {
  id: string;
  name: string;
  clientId?: string; // Optional, as CSV import might not link to an existing client initially
  clientName?: string; // Denormalized for display if clientId exists
  
  primaryContactPhone?: string; // From CSV 'telefono'
  
  lastCallDate?: string; // ISO Date string
  billingAmountEUR?: number;
  collectedAmountEUR?: number;
  
  status: OpportunityStatus;
  proposalStatus?: OpportunityProposalStatus;
  
  processId?: string; // Links to Process.id
  processName?: string; // Denormalized for display
  stageId?: string; // Links to Stage.id
  stageName?: string; // Denormalized for display

  value: number; // Existing field, represents general deal value. Can coexist or be re-evaluated against billingAmountEUR.
  closeDate: string; // ISO Date string
  description?: string;
  assignedTo: string; // User ID - assuming this remains relevant
  
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export type CallType = 
  | 'Descubrimiento1' | 'Descubrimiento2' | 'Descubrimiento3' 
  | 'Cierre1' | 'Cierre2' | 'Cierre3' 
  | 'General' | 'Follow-up' | 'Demo' | 'Other';

export interface Call {
  id: string;
  opportunityId: string; 
  opportunityName?: string; 
  dateTime: string; // ISO Date string - "Fecha y hora"
  summary: string;
  participants: string[]; 
  recordingUrl?: string; // "Enlace a grabación"
  notes?: string; 
  attended?: boolean; // "Estado de asistencia (checkbox)"
  duration?: number; // "Duración" in minutes
  callType?: CallType;

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
  relatedOpportunityName?: string; 
  assignedTo: string; // User ID
  description?: string;
  type: TaskType;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface OpportunityNote {
  id: string;
  opportunityId: string;
  content: string;
  createdByUserId: string; // User ID
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface OpportunityFile {
  id: string;
  opportunityId: string;
  fileName: string;
  fileType: string;
  size: number; // in bytes
  url: string; // URL to access/download the file
  uploadedByUserId: string; // User ID
  uploadDate: string; // ISO Date string
}

export interface OpportunityContact {
  id: string;
  opportunityId: string;
  name: string;
  title?: string; // Puesto en la empresa
  email?: string;
  phone?: string;
  linkedIn?: string;
  company?: string; // Could be same as Client's company or different
  department?: string;
  sourceId?: string; // "Fuente" - ID from a configurable list
  sourceName?: string; // Denormalized
  salesRepId?: string; // "Vendedor asociado" - ID of a user/sales rep from config
  salesRepName?: string; // Denormalized
  createdAt: string;
  updatedAt: string;
}

// --- SAMPLE DATA ---

export const sampleClients: Client[] = [
  { id: 'client-1', name: 'Innovate Corp', email: 'contact@innovate.com', phone: '555-0101', company: 'Innovate Corp', address: '123 Tech Park', financialData: { annualRevenue: 5000000, contractValue: 50000 }, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'client-2', name: 'Synergy Solutions', email: 'info@synergy.com', phone: '555-0102', company: 'Synergy Solutions', address: '456 Business Hub', financialData: { annualRevenue: 10000000, contractValue: 120000 }, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'client-3', name: 'Alpha Dynamics', email: 'alpha@dynamics.com', phone: '555-0103', company: 'Alpha Dynamics', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
];

export const sampleProcesses: Process[] = [
  { id: 'proc-std', name: 'Proceso de Ventas Estándar' },
  { id: 'proc-ent', name: 'Proceso Enterprise' },
  { id: 'proc-smb', name: 'Proceso SMB' },
];

export const sampleStages: Stage[] = [
  // Stages for 'Proceso de Ventas Estándar'
  { id: 'stage-std-1', processId: 'proc-std', name: 'Contacto Inicial', order: 1 },
  { id: 'stage-std-2', processId: 'proc-std', name: 'Calificación', order: 2 },
  { id: 'stage-std-3', processId: 'proc-std', name: 'Propuesta Enviada', order: 3 },
  { id: 'stage-std-4', processId: 'proc-std', name: 'Negociación', order: 4 },
  { id: 'stage-std-5', processId: 'proc-std', name: 'Cerrado Ganado', order: 5 },
  { id: 'stage-std-6', processId: 'proc-std', name: 'Cerrado Perdido', order: 6 },
  // Stages for 'Proceso Enterprise'
  { id: 'stage-ent-1', processId: 'proc-ent', name: 'Descubrimiento Profundo', order: 1 },
  { id: 'stage-ent-2', processId: 'proc-ent', name: 'Presentación Solución', order: 2 },
  { id: 'stage-ent-3', processId: 'proc-ent', name: 'Prueba de Concepto (PoC)', order: 3 },
  { id: 'stage-ent-4', processId: 'proc-ent', name: 'Revisión Legal', order: 4 },
  { id: 'stage-ent-5', processId: 'proc-ent', name: 'Firma Contrato', order: 5 },
  // Stages for 'Proceso SMB'
  { id: 'stage-smb-1', processId: 'proc-smb', name: 'Lead Caliente', order: 1 },
  { id: 'stage-smb-2', processId: 'proc-smb', name: 'Demo Rápida', order: 2 },
  { id: 'stage-smb-3', processId: 'proc-smb', name: 'Oferta', order: 3 },
  { id: 'stage-smb-4', processId: 'proc-smb', name: 'Cierre Venta', order: 4 },
];

export const sampleOpportunities: Opportunity[] = [
  { 
    id: 'opp1', 
    name: 'Innovate Upgrade Project', 
    clientId: 'client-1', 
    clientName: 'Innovate Corp', 
    status: 'Activa',
    proposalStatus: 'Creada',
    processId: 'proc-std',
    processName: sampleProcesses.find(p=>p.id === 'proc-std')?.name,
    stageId: 'stage-std-3',
    stageName: sampleStages.find(s=>s.id === 'stage-std-3')?.name,
    value: 25000, 
    billingAmountEUR: 25000,
    collectedAmountEUR: 5000,
    closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
    assignedTo: 'user1', 
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date().toISOString(), 
    description: "Upgrade Innovate Corp's existing system with new modules.",
    lastCallDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    primaryContactPhone: '555-0101 ext 12'
  },
  { 
    id: 'opp2', 
    name: 'Synergy Full Suite', 
    clientId: 'client-2', 
    clientName: 'Synergy Solutions', 
    status: 'Activa',
    proposalStatus: 'N/A',
    processId: 'proc-ent',
    processName: sampleProcesses.find(p=>p.id === 'proc-ent')?.name,
    stageId: 'stage-ent-1',
    stageName: sampleStages.find(s=>s.id === 'stage-ent-1')?.name,
    value: 75000, 
    billingAmountEUR: 75000,
    closeDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), 
    assignedTo: 'user1', 
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date().toISOString(), 
    description: "Provide Synergy Solutions with the complete Visionarius CRM suite.",
    primaryContactPhone: '555-0102 ext 34'
  },
  { 
    id: 'opp3', 
    name: 'Alpha Dynamics SMB Package', 
    clientId: 'client-3', 
    clientName: 'Alpha Dynamics', 
    status: 'Ganada',
    proposalStatus: 'Presentada',
    processId: 'proc-smb',
    processName: sampleProcesses.find(p=>p.id === 'proc-smb')?.name,
    stageId: 'stage-smb-4',
    stageName: sampleStages.find(s=>s.id === 'stage-smb-4')?.name,
    value: 5000, 
    billingAmountEUR: 5000,
    collectedAmountEUR: 5000,
    closeDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
    assignedTo: 'user1', 
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
    description: "Standard SMB package for Alpha Dynamics.",
    lastCallDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    primaryContactPhone: '555-0103'
  },
];

export const sampleCalls: Call[] = [
  { 
    id: 'call1', 
    opportunityId: 'opp1', 
    opportunityName: 'Innovate Upgrade Project', 
    dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    summary: 'Discussed upgrade requirements. Client interested in AI features.', 
    participants: ['Sales Rep', 'Innovate CTO'], 
    notes: 'Needs a follow-up demo next week.', 
    attended: true,
    duration: 45, // minutes
    callType: 'Descubrimiento1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    recordingUrl: 'https://example.com/recording1.mp3'
  },
  {
    id: 'call2',
    opportunityId: 'opp2',
    opportunityName: 'Synergy Full Suite',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'Initial discovery call with Synergy.',
    participants: ['Sales Rep', 'Synergy VP Sales'],
    notes: 'Client has a budget of $70k, timeline is Q3.',
    attended: true,
    duration: 30,
    callType: 'Descubrimiento1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const sampleTasks: Task[] = [
  { id: 'task1', title: 'Prepare Innovate Proposal', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'In Progress', relatedOpportunityId: 'opp1', relatedOpportunityName: 'Innovate Upgrade Project', assignedTo: 'user1', type: 'Task', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: "Include AI features pricing." },
  { id: 'task2', title: 'Follow up call with Synergy', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Pending', relatedOpportunityId: 'opp2', relatedOpportunityName: 'Synergy Full Suite', assignedTo: 'user1', type: 'Call Reminder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: "Confirm demo for next Monday." },
  { id: 'task3', title: 'Send contract to Alpha Dynamics', dueDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), status: 'Completed', relatedOpportunityId: 'opp3', relatedOpportunityName: 'Alpha Dynamics SMB Package', assignedTo: 'user1', type: 'Task', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
];

export const sampleOpportunityNotes: OpportunityNote[] = [
    { id: 'note1-opp1', opportunityId: 'opp1', content: 'Client mentioned budget constraints but is very interested in the AI module.', createdByUserId: 'user1', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'note2-opp1', opportunityId: 'opp1', content: 'CTO (Jane Doe) will be the main point of contact for technical evaluation.', createdByUserId: 'user1', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

export const sampleOpportunityFiles: OpportunityFile[] = [
    {id: 'file1-opp1', opportunityId: 'opp1', fileName: 'Innovate_RFP_Response.pdf', fileType: 'application/pdf', size: 1205000, url: '/placeholder-docs/Innovate_RFP_Response.pdf', uploadedByUserId: 'user1', uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()},
    {id: 'file2-opp1', opportunityId: 'opp1', fileName: 'Meeting_Notes_Innovate.docx', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 25600, url: '/placeholder-docs/Meeting_Notes_Innovate.docx', uploadedByUserId: 'user1', uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()},
];

export const sampleOpportunityContacts: OpportunityContact[] = [
    {id: 'contact1-opp1', opportunityId: 'opp1', name: 'John Smith (Innovate)', title: 'Project Manager', email: 'john.smith@innovate.com', phone: '555-0101 ext 25', company: 'Innovate Corp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
    {id: 'contact1-opp2', opportunityId: 'opp2', name: 'Alice Wonderland (Synergy)', title: 'VP Operations', email: 'alice.w@synergy.com', phone: '555-0102 ext 50', company: 'Synergy Solutions', sourceId: 'src-referral', sourceName: 'Referral', salesRepId: 'user1', salesRepName: 'Sales Rep', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
];

// For "Fuente" and "Vendedor asociado" configuration (example, not fully implemented UI for config)
export const sampleContactSources = [
    {id: 'src-web', name: 'Website Inquiry'},
    {id: 'src-referral', name: 'Referral'},
    {id: 'src-coldcall', name: 'Cold Call'},
];

export const sampleSalesReps = [ // Assuming these map to user IDs or specific sales rep entities
    {id: 'user1', name: 'Sales Rep A (Main User)'},
    {id: 'user2', name: 'Sales Rep B'},
];

    