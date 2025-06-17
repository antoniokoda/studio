
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Search, PhoneCall, ExternalLink, Filter, ListFilter } from 'lucide-react';
import { Call, sampleCalls, Opportunity, sampleOpportunities, CallType } from '@/types/crm';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const CallForm = ({ 
    call, 
    opportunities, 
    onSave, 
    onCancel 
}: { 
    call?: Call | null, 
    opportunities: Opportunity[], 
    onSave: (call: Call) => void, 
    onCancel: () => void 
}) => {
  const [opportunityId, setOpportunityId] = useState(call?.opportunityId || '');
  const [dateTime, setDateTime] = useState(call?.dateTime ? new Date(call.dateTime).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16));
  const [summary, setSummary] = useState(call?.summary || '');
  const [participants, setParticipants] = useState(call?.participants?.join(', ') || '');
  const [notes, setNotes] = useState(call?.notes || '');
  const [recordingUrl, setRecordingUrl] = useState(call?.recordingUrl || '');
  const [attended, setAttended] = useState(call?.attended === undefined ? true : call.attended);
  const [duration, setDuration] = useState(call?.duration?.toString() || '');
  const [callType, setCallType] = useState<CallType>(call?.callType || 'General');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunityId || !dateTime || !summary || !callType) {
        toast({ title: "Validation Error", description: "Opportunity, Date/Time, Summary, and Call Type are required.", variant: "destructive"});
        return;
    }
    onSave({
      id: call?.id || Date.now().toString(),
      opportunityId,
      opportunityName: opportunities.find(op => op.id === opportunityId)?.name || 'N/A',
      dateTime: new Date(dateTime).toISOString(),
      summary,
      participants: participants.split(',').map(p => p.trim()).filter(p => p),
      notes,
      recordingUrl,
      attended,
      duration: duration ? parseInt(duration, 10) : undefined,
      callType,
      createdAt: call?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const callTypes: CallType[] = ['Descubrimiento1', 'Descubrimiento2', 'Descubrimiento3', 'Cierre1', 'Cierre2', 'Cierre3', 'General', 'Follow-up', 'Demo', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="call-opportunity">Opportunity *</Label>
          <Select value={opportunityId} onValueChange={setOpportunityId} required>
              <SelectTrigger id="call-opportunity">
                  <SelectValue placeholder="Select an opportunity" />
              </SelectTrigger>
              <SelectContent>
                  {opportunities.map(op => (
                      <SelectItem key={op.id} value={op.id}>{op.name} - {op.clientName || op.primaryContactPhone || 'Unknown Client'}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="call-datetime">Date & Time *</Label>
          <Input id="call-datetime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="call-summary">Summary *</Label>
        <Input id="call-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief call summary" required />
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="call-type">Call Type *</Label>
          <Select value={callType} onValueChange={(val) => setCallType(val as CallType)} required>
            <SelectTrigger id="call-type"><SelectValue placeholder="Select call type" /></SelectTrigger>
            <SelectContent>{callTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="call-duration">Duration (minutes)</Label>
          <Input id="call-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 30" />
        </div>
      </div>
      <div>
        <Label htmlFor="call-participants">Participants (comma-separated)</Label>
        <Input id="call-participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="John Doe, Jane Smith" />
      </div>
      <div>
        <Label htmlFor="call-notes">Notes</Label>
        <Textarea id="call-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detailed notes about the call..." />
      </div>
       <div>
        <Label htmlFor="call-recording">Recording URL (Optional)</Label>
        <Input id="call-recording" type="url" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="https://example.com/recording.mp3" />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="call-attended" checked={attended} onCheckedChange={(checked) => setAttended(checked as boolean)} />
        <Label htmlFor="call-attended">Participant(s) Attended</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Call Log</Button>
      </DialogFooter>
    </form>
  );
};


export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCalls(sampleCalls);
    setOpportunities(sampleOpportunities);
  }, []);

  const handleSaveCall = (call: Call) => {
    if (editingCall) {
      setCalls(calls.map(c => c.id === call.id ? call : c));
      toast({ title: "Call Updated", description: `Call log for ${call.opportunityName} has been updated.`});
    } else {
      setCalls([call, ...calls]);
      toast({ title: "Call Logged", description: `New call for ${call.opportunityName} has been logged.`});
    }
    setIsFormOpen(false);
    setEditingCall(null);
  };

  const handleEditCall = (call: Call) => {
    setEditingCall(call);
    setIsFormOpen(true);
  };

  const handleDeleteCall = (callId: string) => {
    if(window.confirm("Are you sure you want to delete this call log?")) {
        setCalls(calls.filter(c => c.id !== callId));
        toast({ title: "Call Deleted", description: `Call log has been removed.`, variant: "destructive"});
    }
  };

  const filteredCalls = calls.filter(call =>
    call.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.opportunityName && call.opportunityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (call.notes && call.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (call.callType && call.callType.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold text-foreground">Call Management</h1>
          <p className="text-muted-foreground">Organize and track your business calls.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingCall(null); }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Log New Call
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCall ? 'Edit Call Log' : 'Log New Call'}</DialogTitle>
              <DialogDescription>
                {editingCall ? 'Update the details for this call.' : 'Enter the details for the new call.'}
              </DialogDescription>
            </DialogHeader>
            <CallForm 
                call={editingCall} 
                opportunities={opportunities}
                onSave={handleSaveCall} 
                onCancel={() => { setIsFormOpen(false); setEditingCall(null); }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
         <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle>Call History</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Input 
                  placeholder="Search calls..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {/* <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filter
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCalls.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Attended</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.map((call) => (
                  <TableRow key={call.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                        <Link href={`/opportunities/${call.opportunityId}`} className="hover:underline text-primary">
                            {call.opportunityName || 'N/A'}
                        </Link>
                    </TableCell>
                    <TableCell>{new Date(call.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{call.summary}</TableCell>
                    <TableCell><Badge variant="secondary">{call.callType || 'N/A'}</Badge></TableCell>
                    <TableCell>{call.attended ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      {call.recordingUrl && (
                        <Button variant="ghost" size="icon" asChild className="mr-1 hover:text-primary">
                           <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" title="Listen to Recording">
                             <PhoneCall className="h-4 w-4" />
                             <span className="sr-only">Listen to Recording</span>
                           </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEditCall(call)} className="mr-1 hover:text-primary" title="Edit Call">
                        <Edit3 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCall(call.id)} className="hover:text-destructive" title="Delete Call">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
             <div className="text-center py-8">
              <p className="text-muted-foreground">No calls found. {searchTerm && "Try adjusting your search."}</p>
              {!searchTerm && 
                <Button variant="link" onClick={() => setIsFormOpen(true)} className="mt-2">
                  Log your first call
                </Button>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    