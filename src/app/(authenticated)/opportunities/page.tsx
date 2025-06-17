'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Search, UploadCloud, Briefcase, Filter } from 'lucide-react';
import { Opportunity, sampleOpportunities, Client, sampleClients, OpportunityStage } from '@/types/crm';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// OpportunityForm component
const OpportunityForm = ({ opportunity, clients, onSave, onCancel }: { opportunity?: Opportunity | null, clients: Client[], onSave: (opportunity: Opportunity) => void, onCancel: () => void }) => {
  const [name, setName] = useState(opportunity?.name || '');
  const [clientId, setClientId] = useState(opportunity?.clientId || '');
  const [stage, setStage] = useState<OpportunityStage>(opportunity?.stage || 'Prospecting');
  const [value, setValue] = useState(opportunity?.value?.toString() || '');
  const [closeDate, setCloseDate] = useState(opportunity?.closeDate ? new Date(opportunity.closeDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]); // For date input
  const [description, setDescription] = useState(opportunity?.description || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !stage || !value || !closeDate) {
        toast({ title: "Validation Error", description: "All fields except description are required.", variant: "destructive"});
        return;
    }
    onSave({
      id: opportunity?.id || Date.now().toString(),
      name,
      clientId,
      clientName: clients.find(c => c.id === clientId)?.name || 'N/A',
      stage,
      value: parseFloat(value),
      closeDate: new Date(closeDate).toISOString(),
      description,
      assignedTo: 'user1', // Placeholder
      createdAt: opportunity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const stages: OpportunityStage[] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="opp-name">Opportunity Name</Label>
        <Input id="opp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Alpha" required />
      </div>
      <div>
        <Label htmlFor="opp-client">Client</Label>
        <Select value={clientId} onValueChange={setClientId} required>
          <SelectTrigger id="opp-client"><SelectValue placeholder="Select a client" /></SelectTrigger>
          <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="opp-stage">Stage</Label>
            <Select value={stage} onValueChange={(val) => setStage(val as OpportunityStage)} required>
            <SelectTrigger id="opp-stage"><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="opp-value">Value ($)</Label>
            <Input id="opp-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="50000" required />
        </div>
      </div>
      <div>
        <Label htmlFor="opp-close-date">Expected Close Date</Label>
        <Input id="opp-close-date" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="opp-description">Description (Optional)</Label>
        <Textarea id="opp-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the opportunity..." />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Opportunity</Button>
      </DialogFooter>
    </form>
  );
};

// OpportunityImportDialog component
const OpportunityImportDialog = ({ onImport, onCancel }: { onImport: (file: File) => void, onCancel: () => void }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Import Opportunities</DialogTitle>
        <DialogDescription>Upload a CSV file to bulk import opportunities. Ensure your CSV has columns: Name, ClientID, Stage, Value, CloseDate, Description.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Label htmlFor="csv-file">CSV File</Label>
        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
        {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleImport} disabled={!file}>Import</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setOpportunities(sampleOpportunities);
    setClients(sampleClients);
  }, []);

  const handleSaveOpportunity = (opportunity: Opportunity) => {
    if (editingOpportunity) {
      setOpportunities(opportunities.map(o => o.id === opportunity.id ? opportunity : o));
      toast({ title: "Opportunity Updated", description: `${opportunity.name} has been updated.`});
    } else {
      setOpportunities([opportunity, ...opportunities]);
      toast({ title: "Opportunity Added", description: `${opportunity.name} has been added.`});
    }
    setIsFormOpen(false);
    setEditingOpportunity(null);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleDeleteOpportunity = (opportunityId: string) => {
     if(window.confirm("Are you sure you want to delete this opportunity?")) {
        setOpportunities(opportunities.filter(o => o.id !== opportunityId));
        toast({ title: "Opportunity Deleted", description: `Opportunity has been removed.`, variant: "destructive"});
    }
  };

  const handleImportOpportunities = (file: File) => {
    // Basic CSV parsing logic (for demonstration, use a library like PapaParse in production)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Import Error", description: "File is empty or unreadable.", variant: "destructive" });
        return;
      }
      const rows = text.split('\n').slice(1); // Skip header
      const newOpportunities: Opportunity[] = [];
      let errors = 0;
      rows.forEach((rowStr, index) => {
        const row = rowStr.split(',');
        if (row.length >= 5) { // Name, ClientID, Stage, Value, CloseDate
          const clientExists = clients.some(c => c.id === row[1]?.trim());
          if (!clientExists) {
            toast({ title: `Import Warning (Row ${index + 2})`, description: `Client ID ${row[1]} not found. Skipping opportunity.`, variant: "destructive"});
            errors++;
            return;
          }
          newOpportunities.push({
            id: `imported-${Date.now()}-${index}`,
            name: row[0]?.trim() || 'Unnamed Opportunity',
            clientId: row[1]?.trim(),
            clientName: clients.find(c => c.id === row[1]?.trim())?.name || 'N/A',
            stage: (row[2]?.trim() as OpportunityStage) || 'Prospecting',
            value: parseFloat(row[3]?.trim()) || 0,
            closeDate: new Date(row[4]?.trim()).toISOString() || new Date().toISOString(),
            description: row[5]?.trim() || '',
            assignedTo: 'user1', // Placeholder
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else if (rowStr.trim() !== "") { // Non-empty row that's too short
            toast({ title: `Import Warning (Row ${index + 2})`, description: `Row has insufficient columns. Skipping.`, variant: "destructive"});
            errors++;
        }
      });
      if (newOpportunities.length > 0) {
        setOpportunities(prev => [...newOpportunities, ...prev]);
        toast({ title: "Import Successful", description: `${newOpportunities.length} opportunities imported. ${errors > 0 ? errors + ' rows had issues.' : ''}`});
      } else if (errors === 0 && rows.every(r => r.trim() === "")) {
         toast({ title: "Import Info", description: "CSV file was empty or contained no valid data rows."});
      } else if (errors > 0 && newOpportunities.length === 0) {
        toast({ title: "Import Failed", description: `No opportunities imported. ${errors} rows had issues.`, variant: "destructive"});
      }
    };
    reader.onerror = () => {
        toast({ title: "Import Error", description: "Failed to read the file.", variant: "destructive"});
    }
    reader.readAsText(file);
    setIsImportOpen(false);
  };
  
  const stageColors: Record<OpportunityStage, string> = {
    Prospecting: 'bg-blue-100 text-blue-800 border-blue-300',
    Qualification: 'bg-purple-100 text-purple-800 border-purple-300',
    Proposal: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Negotiation: 'bg-orange-100 text-orange-800 border-orange-300',
    'Closed Won': 'bg-green-100 text-green-800 border-green-300',
    'Closed Lost': 'bg-red-100 text-red-800 border-red-300',
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.clientName && opp.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    opp.stage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="font-headline text-3xl font-semibold text-foreground">Sales Opportunities</h1>
            <p className="text-muted-foreground">Track and manage your sales pipeline.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                    <UploadCloud className="mr-2 h-5 w-5" /> Import CSV
                    </Button>
                </DialogTrigger>
                <OpportunityImportDialog onImport={handleImportOpportunities} onCancel={() => setIsImportOpen(false)} />
            </Dialog>
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingOpportunity(null); }}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Opportunity
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                    <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
                    <DialogDescription>
                        {editingOpportunity ? 'Update the details for this sales opportunity.' : 'Enter the details for the new sales opportunity.'}
                    </DialogDescription>
                    </DialogHeader>
                    <OpportunityForm 
                        opportunity={editingOpportunity} 
                        clients={clients}
                        onSave={handleSaveOpportunity} 
                        onCancel={() => { setIsFormOpen(false); setEditingOpportunity(null); }} 
                    />
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle>Opportunity Pipeline</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Input 
                  placeholder="Search opportunities..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOpportunities.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.map((opp) => (
                  <TableRow key={opp.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/opportunities/${opp.id}`} className="hover:underline text-primary">
                        {opp.name}
                      </Link>
                    </TableCell>
                    <TableCell>{opp.clientName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={`${stageColors[opp.stage]} border font-semibold`}>{opp.stage}</Badge>
                    </TableCell>
                    <TableCell>${opp.value.toLocaleString()}</TableCell>
                    <TableCell>{new Date(opp.closeDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEditOpportunity(opp)} className="mr-2 hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                         <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOpportunity(opp.id)} className="hover:text-destructive">
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
              <p className="text-muted-foreground">No opportunities found. {searchTerm && "Try adjusting your search."}</p>
              {!searchTerm && 
                <Button variant="link" onClick={() => setIsFormOpen(true)} className="mt-2">
                  Add your first opportunity
                </Button>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
