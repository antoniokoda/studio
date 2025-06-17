'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { Client, sampleClients } from '@/types/crm';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ClientForm component (can be moved to its own file later)
const ClientForm = ({ client, onSave, onCancel }: { client?: Client | null, onSave: (client: Client) => void, onCancel: () => void }) => {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [company, setCompany] = useState(client?.company || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
        toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive"});
        return;
    }
    onSave({
      id: client?.id || Date.now().toString(), // Simple ID generation for demo
      name,
      email,
      phone,
      company,
      createdAt: client?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="client-name">Name</Label>
        <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client Full Name" required />
      </div>
      <div>
        <Label htmlFor="client-email">Email</Label>
        <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" required />
      </div>
      <div>
        <Label htmlFor="client-phone">Phone (Optional)</Label>
        <Input id="client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
      </div>
      <div>
        <Label htmlFor="client-company">Company (Optional)</Label>
        <Input id="client-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Client Company Name" />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Client</Button>
      </DialogFooter>
    </form>
  );
};


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setClients(sampleClients);
  }, []);

  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === client.id ? client : c));
      toast({ title: "Client Updated", description: `${client.name} has been updated successfully.`});
    } else {
      setClients([client, ...clients]);
      toast({ title: "Client Added", description: `${client.name} has been added successfully.`});
    }
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };
  
  const handleDeleteClient = (clientId: string) => {
    // Confirm deletion
    if(window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
        setClients(clients.filter(c => c.id !== clientId));
        toast({ title: "Client Deleted", description: `Client has been removed.`, variant: "destructive"});
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold text-foreground">Client Accounts</h1>
          <p className="text-muted-foreground">Manage your client information and contacts.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingClient(null); }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Update the details for this client.' : 'Enter the details for the new client.'}
              </DialogDescription>
            </DialogHeader>
            <ClientForm 
                client={editingClient} 
                onSave={handleSaveClient} 
                onCancel={() => { setIsFormOpen(false); setEditingClient(null); }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client List</CardTitle>
            <div className="relative w-full max-w-xs">
              <Input 
                placeholder="Search clients..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.company || 'N/A'}</TableCell>
                      <TableCell>{client.phone || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)} className="mr-2 hover:text-primary">
                          <Edit3 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client.id)} className="hover:text-destructive">
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
              <p className="text-muted-foreground">No clients found. {searchTerm && "Try adjusting your search."}</p>
              {!searchTerm && 
                <Button variant="link" onClick={() => setIsFormOpen(true)} className="mt-2">
                  Add your first client
                </Button>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
