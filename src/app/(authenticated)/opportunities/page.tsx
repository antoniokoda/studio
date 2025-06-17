
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Search, UploadCloud, Briefcase, Filter, Download } from 'lucide-react';
import { 
    Opportunity, 
    sampleOpportunities, 
    Client, 
    sampleClients, 
    OpportunityStatus,
    OpportunityProposalStatus,
    Process,
    Stage,
    sampleProcesses,
    sampleStages
} from '@/types/crm';
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
const OpportunityForm = ({ 
    opportunity, 
    clients, 
    processes,
    stages,
    onSave, 
    onCancel 
}: { 
    opportunity?: Opportunity | null, 
    clients: Client[], 
    processes: Process[],
    stages: Stage[],
    onSave: (opportunity: Opportunity) => void, 
    onCancel: () => void 
}) => {
  const [name, setName] = useState(opportunity?.name || '');
  const [clientId, setClientId] = useState(opportunity?.clientId || '');
  const [primaryContactPhone, setPrimaryContactPhone] = useState(opportunity?.primaryContactPhone || '');
  
  const [status, setStatus] = useState<OpportunityStatus>(opportunity?.status || 'Activa');
  const [proposalStatus, setProposalStatus] = useState<OpportunityProposalStatus>(opportunity?.proposalStatus || 'N/A');
  
  const [processId, setProcessId] = useState(opportunity?.processId || '');
  const [stageId, setStageId] = useState(opportunity?.stageId || '');

  const [value, setValue] = useState(opportunity?.value?.toString() || '');
  const [billingAmountEUR, setBillingAmountEUR] = useState(opportunity?.billingAmountEUR?.toString() || '');
  const [collectedAmountEUR, setCollectedAmountEUR] = useState(opportunity?.collectedAmountEUR?.toString() || '');

  const [closeDate, setCloseDate] = useState(opportunity?.closeDate ? new Date(opportunity.closeDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [lastCallDate, setLastCallDate] = useState(opportunity?.lastCallDate ? new Date(opportunity.lastCallDate).toISOString().split('T')[0] : '');
  
  const [description, setDescription] = useState(opportunity?.description || '');
  const { toast } = useToast();

  const availableStages = stages.filter(s => s.processId === processId);

  useEffect(() => {
    // Reset stage if process changes and current stage is not in the new process
    if (processId && !availableStages.find(s => s.id === stageId)) {
      setStageId('');
    }
  }, [processId, stageId, availableStages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !status || !value || !closeDate) {
        toast({ title: "Validation Error", description: "Name, Status, Value, and Close Date are required.", variant: "destructive"});
        return;
    }
    const selectedClient = clients.find(c => c.id === clientId);
    const selectedProcess = processes.find(p => p.id === processId);
    const selectedStage = stages.find(s => s.id === stageId);

    onSave({
      id: opportunity?.id || Date.now().toString(),
      name,
      clientId: clientId || undefined,
      clientName: selectedClient?.name,
      primaryContactPhone,
      status,
      proposalStatus: proposalStatus === 'N/A' ? undefined : proposalStatus,
      processId: processId || undefined,
      processName: selectedProcess?.name,
      stageId: stageId || undefined,
      stageName: selectedStage?.name,
      value: parseFloat(value),
      billingAmountEUR: billingAmountEUR ? parseFloat(billingAmountEUR) : undefined,
      collectedAmountEUR: collectedAmountEUR ? parseFloat(collectedAmountEUR) : undefined,
      closeDate: new Date(closeDate).toISOString(),
      lastCallDate: lastCallDate ? new Date(lastCallDate).toISOString() : undefined,
      description,
      assignedTo: 'user1', // Placeholder
      createdAt: opportunity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const opportunityStatuses: OpportunityStatus[] = ['Activa', 'Ganada', 'Perdida'];
  const opportunityProposalStatuses: OpportunityProposalStatus[] = ['N/A', 'Creada', 'Presentada'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div>
        <Label htmlFor="opp-name">Opportunity Name *</Label>
        <Input id="opp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Alpha" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="opp-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="opp-client"><SelectValue placeholder="Select a client" /></SelectTrigger>
            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="opp-contact-phone">Primary Contact Phone</Label>
            <Input id="opp-contact-phone" value={primaryContactPhone} onChange={(e) => setPrimaryContactPhone(e.target.value)} placeholder="e.g., 555-1234" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="opp-status">Status *</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as OpportunityStatus)} required>
            <SelectTrigger id="opp-status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{opportunityStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="opp-proposal-status">Proposal Status</Label>
            <Select value={proposalStatus} onValueChange={(val) => setProposalStatus(val as OpportunityProposalStatus)}>
            <SelectTrigger id="opp-proposal-status"><SelectValue placeholder="Select proposal status" /></SelectTrigger>
            <SelectContent>{opportunityProposalStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="opp-process">Process</Label>
            <Select value={processId} onValueChange={setProcessId}>
            <SelectTrigger id="opp-process"><SelectValue placeholder="Select process" /></SelectTrigger>
            <SelectContent>{processes.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="opp-stage">Stage (dependent on Process)</Label>
            <Select value={stageId} onValueChange={setStageId} disabled={!processId || availableStages.length === 0}>
            <SelectTrigger id="opp-stage"><SelectValue placeholder={processId ? "Select stage" : "Select process first"} /></SelectTrigger>
            <SelectContent>
                {availableStages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <Label htmlFor="opp-value">Value ($) *</Label>
            <Input id="opp-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="50000" required />
        </div>
        <div>
            <Label htmlFor="opp-billing-eur">Billing (€)</Label>
            <Input id="opp-billing-eur" type="number" value={billingAmountEUR} onChange={(e) => setBillingAmountEUR(e.target.value)} placeholder="25000" />
        </div>
        <div>
            <Label htmlFor="opp-collected-eur">Collected (€)</Label>
            <Input id="opp-collected-eur" type="number" value={collectedAmountEUR} onChange={(e) => setCollectedAmountEUR(e.target.value)} placeholder="5000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="opp-close-date">Expected Close Date *</Label>
            <Input id="opp-close-date" type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} required />
        </div>
        <div>
            <Label htmlFor="opp-last-call-date">Last Call Date</Label>
            <Input id="opp-last-call-date" type="date" value={lastCallDate} onChange={(e) => setLastCallDate(e.target.value)} />
        </div>
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
const OpportunityImportDialog = ({ 
    processes, 
    stages,
    onImport, 
    onCancel 
}: { 
    processes: Process[];
    stages: Stage[];
    onImport: (file: File, processList: Process[], stageList: Stage[]) => void, 
    onCancel: () => void 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({ title: "Invalid File Type", description: "Please upload a .csv file.", variant: "destructive" });
        event.target.value = ''; // Reset file input
        setFile(null);
      }
    }
  };

  const handleImport = () => {
    if (file) {
      onImport(file, processes, stages);
    }
  };

  const downloadTemplate = () => {
    const csvHeaders = "nombre,telefono,proceso_ventas,etapa\n";
    const exampleRow = "Ejemplo Oportunidad,555-123-4567,Proceso de Ventas Estándar,Calificación\n";
    const blob = new Blob([csvHeaders, exampleRow], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_oportunidades.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Import Opportunities from .csv</DialogTitle>
        <DialogDescription>
            Upload a CSV file to bulk import opportunities. Required columns: `nombre`, `telefono`, `proceso_ventas`, `etapa`.
        </DialogDescription>
         <Button variant="link" onClick={downloadTemplate} className="text-sm p-0 h-auto justify-start">
            <Download className="mr-2 h-4 w-4" /> Download CSV Template
        </Button>
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
  const [processes, setProcesses] = useState<Process[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setOpportunities(sampleOpportunities);
    setClients(sampleClients);
    setProcesses(sampleProcesses);
    setStages(sampleStages);
  }, []);

  const handleSaveOpportunity = (opportunity: Opportunity) => {
    if (editingOpportunity) {
      setOpportunities(prevOps => prevOps.map(o => o.id === opportunity.id ? opportunity : o));
      toast({ title: "Opportunity Updated", description: `${opportunity.name} has been updated.`});
    } else {
      setOpportunities(prevOps => [opportunity, ...prevOps]);
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
        setOpportunities(prevOps => prevOps.filter(o => o.id !== opportunityId));
        toast({ title: "Opportunity Deleted", description: `Opportunity has been removed.`, variant: "destructive"});
    }
  };

  const handleImportOpportunities = (file: File, processList: Process[], stageList: Stage[]) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Import Error", description: "File is empty or unreadable.", variant: "destructive" });
        return;
      }
      
      const lines = text.split(/\r\n|\n/);
      if (lines.length <= 1) {
        toast({ title: "Import Info", description: "CSV file is empty or has no data rows.", variant: "destructive" });
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['nombre', 'telefono', 'proceso_ventas', 'etapa'];
      const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));

      if (missingHeaders.length > 0) {
        toast({ title: "Import Error", description: `CSV is missing required headers: ${missingHeaders.join(', ')}.`, variant: "destructive"});
        return;
      }

      const newOpportunities: Opportunity[] = [];
      const errorRows: { rowData: string, reason: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === "") continue; // Skip empty lines

        const data = line.split(',');
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = data[index]?.trim() || '';
        });

        const { nombre, telefono, proceso_ventas, etapa } = rowData;

        if (!nombre) {
          errorRows.push({ rowData: line, reason: "Missing 'nombre' (Opportunity Name)." });
          continue;
        }

        const process = processList.find(p => p.name.toLowerCase() === proceso_ventas.toLowerCase());
        if (!process) {
          errorRows.push({ rowData: line, reason: `Process '${proceso_ventas}' not found in configuration.` });
          continue;
        }

        const stage = stageList.find(s => s.processId === process.id && s.name.toLowerCase() === etapa.toLowerCase());
        if (!stage) {
          errorRows.push({ rowData: line, reason: `Stage '${etapa}' not found in process '${proceso_ventas}'.` });
          continue;
        }

        newOpportunities.push({
          id: `imported-${Date.now()}-${i}`,
          name: nombre,
          primaryContactPhone: telefono,
          processId: process.id,
          processName: process.name,
          stageId: stage.id,
          stageName: stage.name,
          status: 'Activa', // Default status
          value: 0, // Default value, can be adjusted or made optional
          closeDate: new Date().toISOString(), // Default close date
          assignedTo: 'user1', // Placeholder
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (newOpportunities.length > 0) {
        setOpportunities(prev => [...newOpportunities, ...prev]);
      }

      if (errorRows.length > 0) {
        const errorReportHeaders = "RowData,Reason\n";
        const errorReportCsv = errorRows.map(er => `"${er.rowData.replace(/"/g, '""')}","${er.reason.replace(/"/g, '""')}"`).join("\n");
        const blob = new Blob([errorReportHeaders + errorReportCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "reporte_errores_importacion.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        toast({ 
            title: "Import Partially Successful", 
            description: `${newOpportunities.length} opportunities imported. ${errorRows.length} rows had errors. Error report downloaded.`,
            duration: 10000 // Longer duration for this toast
        });
      } else if (newOpportunities.length > 0) {
        toast({ title: "Import Successful", description: `${newOpportunities.length} opportunities imported successfully.`});
      } else {
         toast({ title: "Import Failed", description: `No opportunities imported. ${errorRows.length} rows had issues. Check downloaded error report.`, variant: "destructive"});
      }
    };
    reader.onerror = () => {
        toast({ title: "Import Error", description: "Failed to read the file.", variant: "destructive"});
    }
    reader.readAsText(file);
    setIsImportOpen(false);
  };
  
  const statusColors: Record<OpportunityStatus, string> = {
    Activa: 'bg-blue-100 text-blue-800 border-blue-300',
    Ganada: 'bg-green-100 text-green-800 border-green-300',
    Perdida: 'bg-red-100 text-red-800 border-red-300',
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.clientName && opp.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    opp.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.stageName && opp.stageName.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <UploadCloud className="mr-2 h-5 w-5" /> Import from .csv
                    </Button>
                </DialogTrigger>
                <OpportunityImportDialog 
                    processes={processes} 
                    stages={stages}
                    onImport={handleImportOpportunities} 
                    onCancel={() => setIsImportOpen(false)} 
                />
            </Dialog>
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingOpportunity(null); }}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Opportunity
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl"> {/* Increased width for more fields */}
                    <DialogHeader>
                    <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
                    <DialogDescription>
                        {editingOpportunity ? 'Update the details for this sales opportunity.' : 'Enter the details for the new sales opportunity.'}
                    </DialogDescription>
                    </DialogHeader>
                    <OpportunityForm 
                        opportunity={editingOpportunity} 
                        clients={clients}
                        processes={processes}
                        stages={stages}
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
              {/* Filter button can be implemented later */}
              {/* <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button> */}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Process</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Contact Phone</TableHead>
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
                      <Badge className={`${statusColors[opp.status]} border font-semibold`}>{opp.status}</Badge>
                    </TableCell>
                    <TableCell>{opp.processName || 'N/A'}</TableCell>
                    <TableCell>{opp.stageName || 'N/A'}</TableCell>
                    <TableCell>${opp.value.toLocaleString()}</TableCell>
                    <TableCell>{new Date(opp.closeDate).toLocaleDateString()}</TableCell>
                    <TableCell>{opp.primaryContactPhone || 'N/A'}</TableCell>
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

    