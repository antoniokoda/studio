
// src/components/opportunities/OpportunityDetailSheetContent.tsx
'use client';

import React, { useState } from 'react';
import { Opportunity, Client, Call, Task, OpportunityNote, OpportunityFile, OpportunityContact, OpportunityStatus, OpportunityProposalStatus, sampleProcesses, sampleStages } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CalendarDays, User, Briefcase, Phone, Paperclip, Users2, StickyNote, FileText, ListChecks, Zap } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface OpportunityDetailSheetContentProps {
  opportunity: Opportunity;
  client: Client | null | undefined;
  relatedCalls: Call[];
  relatedTasks: Task[];
  relatedNotes: OpportunityNote[];
  relatedFiles: OpportunityFile[];
  relatedContacts: OpportunityContact[];
  onSaveOpportunity: (updatedOpportunity: Opportunity) => void; // Callback to update parent state
}

export default function OpportunityDetailSheetContent({
  opportunity: initialOpportunity,
  client,
  relatedCalls,
  relatedTasks,
  relatedNotes,
  relatedFiles,
  relatedContacts,
  onSaveOpportunity,
}: OpportunityDetailSheetContentProps) {
  const { toast } = useToast();
  // Local state for editable fields
  const [opportunity, setOpportunity] = useState<Opportunity>(initialOpportunity);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state if the initialOpportunity prop changes (e.g., parent re-fetches)
  React.useEffect(() => {
    setOpportunity(initialOpportunity);
  }, [initialOpportunity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOpportunity(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Opportunity, value: string) => {
    setOpportunity(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOpportunity(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOpportunity(prev => ({ ...prev, [name]: value ? new Date(value).toISOString() : undefined }));
  };


  const handleSave = () => {
    // Basic validation (can be expanded with Zod or similar)
    if (!opportunity.name || !opportunity.status || opportunity.value === undefined || !opportunity.closeDate) {
        toast({ title: "Validation Error", description: "Name, Status, Value, and Close Date are required.", variant: "destructive"});
        return;
    }
    
    // Update processName and stageName if IDs changed
    const selectedProcess = sampleProcesses.find(p => p.id === opportunity.processId);
    const selectedStage = sampleStages.find(s => s.id === opportunity.stageId && s.processId === opportunity.processId);

    const updatedOpportunityWithNames = {
        ...opportunity,
        processName: selectedProcess?.name,
        stageName: selectedStage?.name,
        updatedAt: new Date().toISOString(),
    };
    
    onSaveOpportunity(updatedOpportunityWithNames);
    setIsEditing(false);
    toast({ title: "Opportunity Saved", description: "Details have been updated." });
  };
  
  const statusColors: Record<OpportunityStatus, string> = {
    Activa: 'bg-blue-100 text-blue-800 border-blue-300',
    Ganada: 'bg-green-100 text-green-800 border-green-300',
    Perdida: 'bg-red-100 text-red-800 border-red-300',
  };
  const proposalStatusColors: Record<string, string> = {
    'N/A': 'bg-gray-100 text-gray-800 border-gray-300',
    Creada: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Presentada: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  };
  const opportunityStatuses: OpportunityStatus[] = ['Activa', 'Ganada', 'Perdida'];
  const opportunityProposalStatuses: OpportunityProposalStatus[] = ['N/A', 'Creada', 'Presentada'];
  const availableStages = sampleStages.filter(s => s.processId === opportunity.processId);


  if (!opportunity) return <p>Loading opportunity details...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Opportunity</Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => { setIsEditing(false); setOpportunity(initialOpportunity); }}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>

    {isEditing ? (
        <form className="space-y-4">
            <div>
                <Label htmlFor="sheet-opp-name">Opportunity Name *</Label>
                <Input id="sheet-opp-name" name="name" value={opportunity.name} onChange={handleInputChange} required />
            </div>
            <div>
                <Label htmlFor="sheet-opp-description">Description</Label>
                <Textarea id="sheet-opp-description" name="description" value={opportunity.description || ''} onChange={handleInputChange} />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sheet-opp-value">Value ($) *</Label>
                    <Input id="sheet-opp-value" name="value" type="number" value={opportunity.value || ''} onChange={handleNumberInputChange} required />
                </div>
                <div>
                    <Label htmlFor="sheet-opp-billingAmountEUR">Billing (€)</Label>
                    <Input id="sheet-opp-billingAmountEUR" name="billingAmountEUR" type="number" value={opportunity.billingAmountEUR || ''} onChange={handleNumberInputChange} />
                </div>
                <div>
                    <Label htmlFor="sheet-opp-collectedAmountEUR">Collected (€)</Label>
                    <Input id="sheet-opp-collectedAmountEUR" name="collectedAmountEUR" type="number" value={opportunity.collectedAmountEUR || ''} onChange={handleNumberInputChange} />
                </div>
                 <div>
                    <Label htmlFor="sheet-opp-primaryContactPhone">Primary Contact Phone</Label>
                    <Input id="sheet-opp-primaryContactPhone" name="primaryContactPhone" value={opportunity.primaryContactPhone || ''} onChange={handleInputChange} />
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sheet-opp-status">Status *</Label>
                    <Select value={opportunity.status} onValueChange={(val) => handleSelectChange('status', val as OpportunityStatus)} required>
                        <SelectTrigger id="sheet-opp-status"><SelectValue /></SelectTrigger>
                        <SelectContent>{opportunityStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="sheet-opp-proposalStatus">Proposal Status</Label>
                    <Select value={opportunity.proposalStatus || 'N/A'} onValueChange={(val) => handleSelectChange('proposalStatus', val as OpportunityProposalStatus)}>
                        <SelectTrigger id="sheet-opp-proposalStatus"><SelectValue /></SelectTrigger>
                        <SelectContent>{opportunityProposalStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sheet-opp-processId">Process</Label>
                    <Select value={opportunity.processId || ''} onValueChange={(val) => {
                        handleSelectChange('processId', val);
                        // Reset stage when process changes
                        const newProcessStages = sampleStages.filter(s => s.processId === val);
                        if (newProcessStages.length > 0) {
                            handleSelectChange('stageId', newProcessStages[0].id); 
                        } else {
                             handleSelectChange('stageId', '');
                        }
                    }}>
                        <SelectTrigger id="sheet-opp-processId"><SelectValue placeholder="Select process" /></SelectTrigger>
                        <SelectContent>{sampleProcesses.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="sheet-opp-stageId">Stage</Label>
                    <Select value={opportunity.stageId || ''} onValueChange={(val) => handleSelectChange('stageId', val)} disabled={!opportunity.processId || availableStages.length === 0}>
                        <SelectTrigger id="sheet-opp-stageId"><SelectValue placeholder={opportunity.processId ? "Select stage" : "Select process first"} /></SelectTrigger>
                        <SelectContent>
                            {availableStages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sheet-opp-closeDate">Expected Close Date *</Label>
                    <Input id="sheet-opp-closeDate" name="closeDate" type="date" value={opportunity.closeDate ? opportunity.closeDate.split('T')[0] : ''} onChange={handleDateChange} required />
                </div>
                <div>
                    <Label htmlFor="sheet-opp-lastCallDate">Last Call Date</Label>
                    <Input id="sheet-opp-lastCallDate" name="lastCallDate" type="date" value={opportunity.lastCallDate ? opportunity.lastCallDate.split('T')[0] : ''} onChange={handleDateChange} />
                </div>
            </div>
            {/* Client link cannot be edited here directly, handled in main form or client page */}
        </form>
    ) : (
      <Card className="shadow-none border-none">
        <CardContent className="p-0 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Opportunity Details</h3>
              <p className="text-muted-foreground">{opportunity.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2"><DollarSign className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Value: </span><span className="font-semibold text-lg">${opportunity.value.toLocaleString()}</span></div></div>
                <div className="flex items-start gap-2"><DollarSign className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Billing (€): </span><span className="font-semibold text-lg">{opportunity.billingAmountEUR ? `€${opportunity.billingAmountEUR.toLocaleString()}` : 'N/A'}</span></div></div>
                <div className="flex items-start gap-2"><DollarSign className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Collected (€): </span><span className="font-semibold text-lg">{opportunity.collectedAmountEUR ? `€${opportunity.collectedAmountEUR.toLocaleString()}` : 'N/A'}</span></div></div>
                <div className="flex items-start gap-2"><CalendarDays className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Expected Close: </span><span>{new Date(opportunity.closeDate).toLocaleDateString()}</span></div></div>
                <div className="flex items-start gap-2"><CalendarDays className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Last Call: </span><span>{opportunity.lastCallDate ? new Date(opportunity.lastCallDate).toLocaleDateString() : 'N/A'}</span></div></div>
                <div className="flex items-start gap-2"><Zap className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Status: </span><Badge className={`${statusColors[opportunity.status]} border font-semibold`}>{opportunity.status}</Badge></div></div>
                <div className="flex items-start gap-2"><FileText className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Proposal: </span><Badge className={`${proposalStatusColors[opportunity.proposalStatus || 'N/A']} border font-semibold`}>{opportunity.proposalStatus || 'N/A'}</Badge></div></div>
                <div className="flex items-start gap-2"><Briefcase className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Process: </span><span>{opportunity.processName || 'N/A'}</span></div></div>
                <div className="flex items-start gap-2"><Zap className="h-5 w-5 text-primary mt-0.5"/><div><span className="font-medium text-muted-foreground block">Stage: </span><span>{opportunity.stageName || 'N/A'}</span></div></div>
            </div>
          </div>
          <div className="space-y-4">
            {client && (
                <Card className="bg-muted/50"><CardHeader className="pb-2 flex flex-row items-center gap-2"><User className="h-5 w-5 text-primary"/><CardTitle className="text-base">Client Information</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p><strong>Name:</strong> <Link href={`/clients/${client.id}`} className="text-primary hover:underline">{client.name}</Link></p><p><strong>Company:</strong> {client.company || 'N/A'}</p><p><strong>Email:</strong> {client.email}</p><p><strong>Phone:</strong> {client.phone || 'N/A'}</p></CardContent></Card>
            )}
            {opportunity.primaryContactPhone && (
                 <Card className="bg-muted/50"><CardHeader className="pb-2 flex flex-row items-center gap-2"><Phone className="h-5 w-5 text-primary"/><CardTitle className="text-base">Primary Contact</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p><strong>Phone:</strong> {opportunity.primaryContactPhone}</p></CardContent></Card>
            )}
          </div>
        </CardContent>
      </Card>
    )}

      {/* Related Information Sections - Read-only for now */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card><CardHeader className="flex flex-row items-center gap-2"><Phone className="h-5 w-5 text-primary" /><CardTitle>Related Calls</CardTitle></CardHeader><CardContent>{relatedCalls.length > 0 ? <ul className="space-y-2 max-h-48 overflow-y-auto">{relatedCalls.map(call => <li key={call.id} className="p-2 bg-muted/30 rounded text-xs"><strong>{call.summary}</strong> ({new Date(call.dateTime).toLocaleDateString()}) - {call.callType}</li>)}</ul> : <p className="text-xs text-muted-foreground">No calls.</p>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center gap-2"><Users2 className="h-5 w-5 text-primary" /><CardTitle>Related Contacts</CardTitle></CardHeader><CardContent>{relatedContacts.length > 0 ? <ul className="space-y-2 max-h-48 overflow-y-auto">{relatedContacts.map(contact => <li key={contact.id} className="p-2 bg-muted/30 rounded text-xs"><strong>{contact.name}</strong> ({contact.title || 'N/A'})</li>)}</ul> : <p className="text-xs text-muted-foreground">No contacts.</p>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /><CardTitle>Related Tasks</CardTitle></CardHeader><CardContent>{relatedTasks.length > 0 ? <ul className="space-y-2 max-h-48 overflow-y-auto">{relatedTasks.map(task => <li key={task.id} className="p-2 bg-muted/30 rounded text-xs"><strong>{task.title}</strong> (Due: {new Date(task.dueDate).toLocaleDateString()}) <Badge variant={task.status === "Completed" ? "default" : "secondary"} className="text-xs">{task.status}</Badge></li>)}</ul> : <p className="text-xs text-muted-foreground">No tasks.</p>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center gap-2"><StickyNote className="h-5 w-5 text-primary" /><CardTitle>Notes</CardTitle></CardHeader><CardContent>{relatedNotes.length > 0 ? <ul className="space-y-2 max-h-48 overflow-y-auto">{relatedNotes.map(note => <li key={note.id} className="p-2 bg-muted/30 rounded text-xs">{note.content} <span className="text-muted-foreground/70">({new Date(note.createdAt).toLocaleDateString()})</span></li>)}</ul> : <p className="text-xs text-muted-foreground">No notes.</p>}</CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center gap-2"><Paperclip className="h-5 w-5 text-primary" /><CardTitle>Files</CardTitle></CardHeader><CardContent>{relatedFiles.length > 0 ? <ul className="space-y-2 max-h-48 overflow-y-auto">{relatedFiles.map(file => <li key={file.id} className="p-2 bg-muted/30 rounded text-xs"><a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{file.fileName}</a></li>)}</ul> : <p className="text-xs text-muted-foreground">No files.</p>}</CardContent></Card>
      </div>
    </div>
  );
}
