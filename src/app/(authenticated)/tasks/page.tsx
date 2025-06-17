'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, Search, Filter, ListChecks, CalendarDays, CheckCircle, RadioButton } from 'lucide-react';
import { Task, sampleTasks, Opportunity, sampleOpportunities, TaskStatus, TaskType } from '@/types/crm';
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
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// TaskForm component
const TaskForm = ({ task, opportunities, onSave, onCancel }: { task?: Task | null, opportunities: Opportunity[], onSave: (task: Task) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [relatedOpportunityId, setRelatedOpportunityId] = useState(task?.relatedOpportunityId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Pending');
  const [type, setType] = useState<TaskType>(task?.type || 'Task');
  const [description, setDescription] = useState(task?.description || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !status || !type) {
      toast({ title: "Validation Error", description: "Title, Due Date, Status, and Type are required.", variant: "destructive" });
      return;
    }
    onSave({
      id: task?.id || Date.now().toString(),
      title,
      relatedOpportunityId,
      relatedOpportunityName: opportunities.find(op => op.id === relatedOpportunityId)?.name,
      dueDate: new Date(dueDate).toISOString(),
      status,
      type,
      description,
      assignedTo: 'user1', // Placeholder for assigned user
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const taskStatuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
  const taskTypes: TaskType[] = ['Task', 'Notification', 'Call Reminder'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="task-title">Title</Label>
        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up with Client X" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="task-opportunity">Related Opportunity (Optional)</Label>
          <Select value={relatedOpportunityId} onValueChange={setRelatedOpportunityId}>
            <SelectTrigger id="task-opportunity"><SelectValue placeholder="Select an opportunity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {opportunities.map(op => <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="task-due-date">Due Date</Label>
          <Input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="task-status">Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)} required>
            <SelectTrigger id="task-status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{taskStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="task-type">Type</Label>
          <Select value={type} onValueChange={(val) => setType(val as TaskType)} required>
            <SelectTrigger id="task-type"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{taskTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="task-description">Description (Optional)</Label>
        <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the task..." />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Task</Button>
      </DialogFooter>
    </form>
  );
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTasks(sampleTasks);
    setOpportunities(sampleOpportunities);
  }, []);

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
      toast({ title: "Task Updated", description: `Task "${task.title}" has been updated.` });
    } else {
      setTasks([task, ...tasks]);
      toast({ title: "Task Added", description: `New task "${task.title}" has been added.` });
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({ title: "Task Deleted", description: `Task has been removed.`, variant: "destructive" });
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.relatedOpportunityName && task.relatedOpportunityName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const statusIcons: Record<TaskStatus, React.ElementType> = {
    'Pending': RadioButton,
    'In Progress': ListChecks,
    'Completed': CheckCircle,
  };
  
  const statusColors: Record<TaskStatus, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'Completed': 'bg-green-100 text-green-800 border-green-300',
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Manage all your tasks and notifications.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingTask(null); }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Update the details for this task.' : 'Enter the details for the new task.'}
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              opportunities={opportunities}
              onSave={handleSaveTask}
              onCancel={() => { setIsFormOpen(false); setEditingTask(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle>Task List</CardTitle>
             <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                <Input 
                  placeholder="Search tasks..." 
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
          {filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Related Opportunity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const StatusIcon = statusIcons[task.status];
                  return (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                            {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[task.status]} border font-semibold`}>
                            <StatusIcon className="mr-1 h-3 w-3"/>
                            {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.relatedOpportunityId && task.relatedOpportunityName ? (
                          <Link href={`/opportunities/${task.relatedOpportunityId}`} className="text-primary hover:underline">
                            {task.relatedOpportunityName}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="mr-2 hover:text-primary">
                          <Edit3 className="h-4 w-4" />
                           <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          ) : (
             <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks found. {searchTerm && "Try adjusting your search."}</p>
              {!searchTerm && 
                <Button variant="link" onClick={() => setIsFormOpen(true)} className="mt-2">
                  Add your first task
                </Button>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
