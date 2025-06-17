
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Opportunity, sampleOpportunities, 
    Call, sampleCalls, 
    Task, sampleTasks, 
    Client, sampleClients,
    OpportunityNote, sampleOpportunityNotes,
    OpportunityFile, sampleOpportunityFiles,
    OpportunityContact, sampleOpportunityContacts,
    OpportunityStatus,
    sampleProcesses, // For AI Assistant context
    sampleStages    // For AI Assistant context
} from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Edit, MessageSquare, Zap, DollarSign, CalendarDays, User, Briefcase, Phone, Paperclip, Users2, StickyNote, FileText, ListChecks } from 'lucide-react'; // Added ListChecks
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Import AI functions (assuming they are server actions)
import { suggestFollowUpActions, SuggestFollowUpActionsInput } from '@/ai/flows/call-assistant';
import { generateTalkingPoints, GenerateTalkingPointsInput } from '@/ai/flows/generate-talking-points';

// AI Assistant Component (remains largely the same)
const AiAssistant = ({ opportunity, relatedCalls }: { opportunity: Opportunity, relatedCalls: Call[] }) => {
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [followUpActions, setFollowUpActions] = useState<string[]>([]);
  const [isLoadingTalkingPoints, setIsLoadingTalkingPoints] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const { toast } = useToast();

  const client = opportunity.clientId ? sampleClients.find(c => c.id === opportunity.clientId) : null;

  const handleGenerateTalkingPoints = async () => {
    setIsLoadingTalkingPoints(true);
    try {
      const pastInteractions = relatedCalls.map(call => `Call on ${new Date(call.dateTime).toLocaleDateString()}: ${call.summary}. Notes: ${call.notes || ''}`).join('\n');
      const input: GenerateTalkingPointsInput = {
        pastInteractions: pastInteractions || "No past call interactions recorded for this opportunity.",
        opportunityDetails: `Name: ${opportunity.name}, Status: ${opportunity.status}, Stage: ${opportunity.stageName || 'N/A'}, Value: $${opportunity.value}, Description: ${opportunity.description || 'N/A'}`,
        clientProfile: `Client: ${opportunity.clientName || 'N/A (No client linked)'}, Company: ${client?.company || 'N/A'}, Email: ${client?.email || 'N/A'}`,
      };
      const result = await generateTalkingPoints(input);
      setTalkingPoints(result.talkingPoints);
      toast({ title: "AI Success", description: "Talking points generated." });
    } catch (error) {
      console.error("Error generating talking points:", error);
      toast({ title: "AI Error", description: "Could not generate talking points.", variant: "destructive" });
    }
    setIsLoadingTalkingPoints(false);
  };

  const handleSuggestFollowUpActions = async () => {
    setIsLoadingFollowUp(true);
    try {
      const latestCall = relatedCalls.length > 0 ? relatedCalls[0] : null;
      const input: SuggestFollowUpActionsInput = {
        callSummary: latestCall ? latestCall.summary : "No recent call summary available for this opportunity.",
        pastInteractions: relatedCalls.map(call => `Call on ${new Date(call.dateTime).toLocaleDateString()}: ${call.summary}`).join('\n') || "No past interactions.",
        notes: latestCall ? latestCall.notes : opportunity.description,
      };
      const result = await suggestFollowUpActions(input);
      setFollowUpActions(result.followUpActions);
      toast({ title: "AI Success", description: "Follow-up actions suggested." });
    } catch (error) {
      console.error("Error suggesting follow-up actions:", error);
      toast({ title: "AI Error", description: "Could not suggest follow-up actions.", variant: "destructive" });
    }
    setIsLoadingFollowUp(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>AI Call Assistant</CardTitle>
        </div>
        <CardDescription>Get AI-powered insights for this opportunity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button onClick={handleGenerateTalkingPoints} disabled={isLoadingTalkingPoints} className="w-full sm:w-auto">
            {isLoadingTalkingPoints ? 'Generating...' : 'Generate Talking Points'} <Zap className="ml-2 h-4 w-4" />
          </Button>
          {talkingPoints.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold">Suggested Talking Points:</h4>
              <ul className="list-disc list-inside text-sm">
                {talkingPoints.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div>
          <Button onClick={handleSuggestFollowUpActions} disabled={isLoadingFollowUp} className="w-full sm:w-auto">
            {isLoadingFollowUp ? 'Suggesting...' : 'Suggest Follow-up Actions'} <MessageSquare className="ml-2 h-4 w-4" />
          </Button>
          {followUpActions.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold">Suggested Follow-up Actions:</h4>
              <ul className="list-disc list-inside text-sm">
                {followUpActions.map((action, index) => <li key={index}>{action}</li>)}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [relatedCalls, setRelatedCalls] = useState<Call[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [relatedNotes, setRelatedNotes] = useState<OpportunityNote[]>([]);
  const [relatedFiles, setRelatedFiles] = useState<OpportunityFile[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<OpportunityContact[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  const opportunityId = params.id as string;

  useEffect(() => {
    if (opportunityId) {
      const foundOpportunity = sampleOpportunities.find(op => op.id === opportunityId);
      setOpportunity(foundOpportunity || null);
      if (foundOpportunity) {
        if (foundOpportunity.clientId) {
            setClient(sampleClients.find(c => c.id === foundOpportunity.clientId) || null);
        } else {
            setClient(null);
        }
        setRelatedCalls(sampleCalls.filter(call => call.opportunityId === opportunityId).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        setRelatedTasks(sampleTasks.filter(task => task.relatedOpportunityId === opportunityId));
        setRelatedNotes(sampleOpportunityNotes.filter(note => note.opportunityId === opportunityId));
        setRelatedFiles(sampleOpportunityFiles.filter(file => file.opportunityId === opportunityId));
        setRelatedContacts(sampleOpportunityContacts.filter(contact => contact.opportunityId === opportunityId));
      }
    }
  }, [opportunityId]);

  const handleOpportunityUpdate = (updatedOpportunity: Opportunity) => {
    // This function would ideally save to a backend.
    // For now, it updates the local state of this page.
    setOpportunity(updatedOpportunity);
    // Also update the master list in sampleOpportunities if you want changes to persist across navigations (for demo only)
    const index = sampleOpportunities.findIndex(op => op.id === updatedOpportunity.id);
    if (index !== -1) {
      sampleOpportunities[index] = updatedOpportunity;
    }
    toast({ title: "Opportunity Updated", description: "Details saved." });
  };


  if (!opportunity) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">Opportunity not found.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
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


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push('/opportunities')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities
        </Button>
        {/* The Edit button here could open a modal/form specific to this full page, or be removed if all editing happens in the list view's sheet */}
        <Button size="sm" onClick={() => toast({title: "Edit Action", description:"Full page edit functionality could be implemented here, or rely on the sheet from the main list."})}>
          <Edit className="mr-2 h-4 w-4" /> Edit (Full Page)
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8"/>
            <CardTitle className="font-headline text-3xl">{opportunity.name}</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 text-sm">
            Detailed view of the sales opportunity. Created: {new Date(opportunity.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Opportunity Details</h3>
              <p className="text-muted-foreground">{opportunity.description || 'No description provided.'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5"/> 
                    <div>
                        <span className="font-medium text-muted-foreground block">Value: </span>
                        <span className="font-semibold text-lg">${opportunity.value.toLocaleString()}</span>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5"/> 
                    <div>
                        <span className="font-medium text-muted-foreground block">Billing (€): </span>
                        <span className="font-semibold text-lg">{opportunity.billingAmountEUR ? `€${opportunity.billingAmountEUR.toLocaleString()}` : 'N/A'}</span>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5"/> 
                    <div>
                        <span className="font-medium text-muted-foreground block">Collected (€): </span>
                        <span className="font-semibold text-lg">{opportunity.collectedAmountEUR ? `€${opportunity.collectedAmountEUR.toLocaleString()}` : 'N/A'}</span>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5"/> 
                    <div>
                        <span className="font-medium text-muted-foreground block">Expected Close Date: </span>
                        <span>{new Date(opportunity.closeDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <CalendarDays className="h-5 w-5 text-primary mt-0.5"/> 
                    <div>
                        <span className="font-medium text-muted-foreground block">Last Call Date: </span>
                        <span>{opportunity.lastCallDate ? new Date(opportunity.lastCallDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
                
                <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5"/> 
                     <div>
                        <span className="font-medium text-muted-foreground block">Status: </span>
                        <Badge className={`${statusColors[opportunity.status]} border font-semibold`}>{opportunity.status}</Badge>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-0.5"/> 
                     <div>
                        <span className="font-medium text-muted-foreground block">Proposal Status: </span>
                        <Badge className={`${proposalStatusColors[opportunity.proposalStatus || 'N/A']} border font-semibold`}>{opportunity.proposalStatus || 'N/A'}</Badge>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5"/> 
                     <div>
                        <span className="font-medium text-muted-foreground block">Process: </span>
                        <span>{opportunity.processName || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5"/> 
                     <div>
                        <span className="font-medium text-muted-foreground block">Stage: </span>
                        <span>{opportunity.stageName || 'N/A'}</span>
                    </div>
                </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {client && (
                <Card className="bg-muted/50">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <User className="h-5 w-5 text-primary"/>
                    <CardTitle className="text-base">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p><strong>Name:</strong> <Link href={`/clients/${client.id}`} className="text-primary hover:underline">{client.name}</Link></p>
                    <p><strong>Company:</strong> {client.company || 'N/A'}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
                </CardContent>
                </Card>
            )}
            {opportunity.primaryContactPhone && (
                 <Card className="bg-muted/50">
                    <CardHeader className="pb-2 flex flex-row items-center gap-2">
                        <Phone className="h-5 w-5 text-primary"/>
                        <CardTitle className="text-base">Primary Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p><strong>Phone:</strong> {opportunity.primaryContactPhone}</p>
                    </CardContent>
                </Card>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AiAssistant opportunity={opportunity} relatedCalls={relatedCalls} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <CardTitle>Related Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedCalls.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {relatedCalls.map(call => (
                  <li key={call.id} className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-semibold">{call.summary} ({call.callType || 'General'})</p>
                    <p><strong>Date:</strong> {new Date(call.dateTime).toLocaleString()}</p>
                    <p><strong>Duration:</strong> {call.duration ? `${call.duration} mins` : 'N/A'}</p>
                    <p><strong>Attended:</strong> {call.attended ? 'Yes' : 'No'}</p>
                    {call.notes && <p className="mt-1 text-xs italic">Notes: {call.notes}</p>}
                    {call.recordingUrl && <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs block mt-1">Listen to Recording</a>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No calls logged.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <CardTitle>Related Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedContacts.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {relatedContacts.map(contact => (
                  <li key={contact.id} className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-semibold">{contact.name} <span className="text-xs text-muted-foreground">({contact.title || 'N/A'})</span></p>
                    {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
                    {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                    {contact.company && <p><strong>Company:</strong> {contact.company}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No additional contacts specific to this opportunity.</p>}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <CardTitle>Related Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedTasks.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {relatedTasks.map(task => (
                  <li key={task.id} className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-semibold">{task.title}</p>
                    <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>{task.status}</Badge></p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No tasks for this opportunity.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedNotes.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {relatedNotes.map(note => (
                  <li key={note.id} className="p-3 bg-muted rounded-md text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        By: {note.createdByUserId} on {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No notes for this opportunity.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-2">
            <Paperclip className="h-5 w-5 text-primary" />
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedFiles.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {relatedFiles.map(file => (
                  <li key={file.id} className="p-3 bg-muted rounded-md text-sm">
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                        {file.fileName}
                    </a>
                    <p className="text-xs text-muted-foreground">{file.fileType} - {(file.size / 1024).toFixed(2)} KB</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Uploaded by: {file.uploadedByUserId} on {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No files attached to this opportunity.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
