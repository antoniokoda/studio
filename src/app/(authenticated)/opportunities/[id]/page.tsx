'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Opportunity, sampleOpportunities, Call, sampleCalls, Task, sampleTasks, Client, sampleClients } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bot, Edit, MessageSquare, Zap, DollarSign, CalendarDays, User, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Import AI functions (assuming they are server actions)
import { suggestFollowUpActions, SuggestFollowUpActionsInput, SuggestFollowUpActionsOutput } from '@/ai/flows/call-assistant';
import { generateTalkingPoints, GenerateTalkingPointsInput, GenerateTalkingPointsOutput } from '@/ai/flows/generate-talking-points';

// Placeholder for AI Assistant Component
const AiAssistant = ({ opportunity, relatedCalls }: { opportunity: Opportunity, relatedCalls: Call[] }) => {
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [followUpActions, setFollowUpActions] = useState<string[]>([]);
  const [isLoadingTalkingPoints, setIsLoadingTalkingPoints] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const { toast } = useToast();

  const client = sampleClients.find(c => c.id === opportunity.clientId);

  const handleGenerateTalkingPoints = async () => {
    setIsLoadingTalkingPoints(true);
    try {
      const pastInteractions = relatedCalls.map(call => `Call on ${new Date(call.dateTime).toLocaleDateString()}: ${call.summary}. Notes: ${call.notes || ''}`).join('\n');
      const input: GenerateTalkingPointsInput = {
        pastInteractions: pastInteractions || "No past call interactions recorded for this opportunity.",
        opportunityDetails: `Name: ${opportunity.name}, Stage: ${opportunity.stage}, Value: $${opportunity.value}, Description: ${opportunity.description || 'N/A'}`,
        clientProfile: `Client: ${opportunity.clientName}, Company: ${client?.company || 'N/A'}, Email: ${client?.email || 'N/A'}`,
      };
      const result = await generateTalkingPoints(input);
      setTalkingPoints(result.talkingPoints);
      // Optionally set follow-up actions from talking points generation if applicable
      // setFollowUpActions(result.followUpActions); 
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
      const latestCall = relatedCalls.length > 0 ? relatedCalls[0] : null; // Assuming calls are sorted by date descending
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
  const [client, setClient] = useState<Client | null>(null);

  const opportunityId = params.id as string;

  useEffect(() => {
    if (opportunityId) {
      const foundOpportunity = sampleOpportunities.find(op => op.id === opportunityId);
      setOpportunity(foundOpportunity || null);
      if (foundOpportunity) {
        setClient(sampleClients.find(c => c.id === foundOpportunity.clientId) || null);
        setRelatedCalls(sampleCalls.filter(call => call.opportunityId === opportunityId).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
        setRelatedTasks(sampleTasks.filter(task => task.relatedOpportunityId === opportunityId));
      }
    }
  }, [opportunityId]);

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
  
  const stageColors: Record<Opportunity['stage'], string> = {
    Prospecting: 'bg-blue-100 text-blue-800 border-blue-300',
    Qualification: 'bg-purple-100 text-purple-800 border-purple-300',
    Proposal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Negotiation: 'bg-orange-100 text-orange-800 border-orange-300',
    'Closed Won': 'bg-green-100 text-green-800 border-green-300',
    'Closed Lost': 'bg-red-100 text-red-800 border-red-300',
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities
        </Button>
        <Button size="sm" onClick={() => toast({title: "Edit Clicked", description:"Edit functionality to be implemented."})}>
          <Edit className="mr-2 h-4 w-4" /> Edit Opportunity
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8"/>
            <CardTitle className="font-headline text-3xl">{opportunity.name}</CardTitle>
          </div>
          <CardDescription className="text-primary-foreground/80 text-sm">
            Detailed view of the sales opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Opportunity Details</h3>
              <p className="text-muted-foreground">{opportunity.description || 'No description provided.'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary"/> 
                    <div>
                        <span className="font-medium">Value: </span>
                        <span>${opportunity.value.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary"/>
                    <div>
                        <span className="font-medium">Client: </span>
                        <Link href={`/clients/${opportunity.clientId}`} className="text-primary hover:underline">
                            {opportunity.clientName || 'N/A'}
                        </Link>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary"/> 
                    <div>
                        <span className="font-medium">Close Date: </span>
                        <span>{new Date(opportunity.closeDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary"/> 
                     <div>
                        <span className="font-medium">Stage: </span>
                        <Badge className={`${stageColors[opportunity.stage]} border font-semibold`}>{opportunity.stage}</Badge>
                    </div>
                </div>
            </div>
          </div>
          
          {client && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><strong>Company:</strong> {client.company || 'N/A'}</p>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
      <AiAssistant opportunity={opportunity} relatedCalls={relatedCalls} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Related Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedCalls.length > 0 ? (
              <ul className="space-y-3">
                {relatedCalls.map(call => (
                  <li key={call.id} className="p-3 bg-muted rounded-md text-sm">
                    <p><strong>Date:</strong> {new Date(call.dateTime).toLocaleString()}</p>
                    <p><strong>Summary:</strong> {call.summary}</p>
                    {call.notes && <p className="mt-1 text-xs italic">Notes: {call.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No calls logged for this opportunity.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Related Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedTasks.length > 0 ? (
              <ul className="space-y-3">
                {relatedTasks.map(task => (
                  <li key={task.id} className="p-3 bg-muted rounded-md text-sm">
                    <p><strong>Task:</strong> {task.title}</p>
                    <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>{task.status}</Badge></p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No tasks for this opportunity.</p>}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
