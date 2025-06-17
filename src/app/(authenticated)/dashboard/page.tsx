'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, BarChart, DollarSign, Users, Activity, CheckCircle, Bell, PhoneOutgoing, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { sampleOpportunities, sampleTasks, Task, Opportunity } from '@/types/crm';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Area, ComposedChart } from "recharts"


const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  deals: { label: "Deals", color: "hsl(var(--chart-2))" },
  activities: { label: "Activities", color: "hsl(var(--chart-3))" },
};

const KpiCard = ({ title, value, icon: Icon, trend, trendValue, description, progress }: { title: string, value: string, icon: React.ElementType, trend?: 'up' | 'down', trendValue?: string, description: string, progress?: number }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold font-headline">{value}</div>
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
      {trend && trendValue && (
        <div className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
          {trendValue}
        </div>
      )}
      {progress !== undefined && <Progress value={progress} className="mt-2 h-2" />}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching data
    setOpportunities(sampleOpportunities.slice(0, 3)); // Display a few recent ones
    setTasks(sampleTasks.filter(task => task.status !== 'Completed').slice(0, 3));

    // Sample sales data for the chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    setSalesData(months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      deals: Math.floor(Math.random() * 20) + 5,
    })));

  }, []);

  const kpiData = [
    { title: 'Total Revenue', value: '$125,670', icon: DollarSign, trend: 'up' as const, trendValue: '+15.2% from last month', description: 'Overall sales performance' },
    { title: 'Active Deals', value: '32', icon: Briefcase, progress: 65, description: 'Opportunities in pipeline' },
    { title: 'New Clients', value: '8', icon: Users, trend: 'up' as const, trendValue: '+3 this month', description: 'Growth in client base' },
    { title: 'Activities Logged', value: '156', icon: Activity, description: 'Calls, meetings, and tasks' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-semibold text-foreground">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Monthly revenue and deal count.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={salesData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="revenue" yAxisId="left" fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" stackId="1" />
                    <Bar dataKey="deals" yAxisId="right" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Tasks & Activities</CardTitle>
            <CardDescription>Stay on top of your priorities.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={task.status === 'Pending' ? 'secondary' : 'default'}>
                          {task.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No upcoming tasks.</p>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/tasks">View All Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
          <CardDescription>Quick look at your active deals.</CardDescription>
        </CardHeader>
        <CardContent>
           {opportunities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map(opp => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">
                      <Link href={`/opportunities/${opp.id}`} className="hover:underline text-primary">
                        {opp.name}
                      </Link>
                    </TableCell>
                    <TableCell>{opp.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{opp.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${opp.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No recent opportunities.</p>
          )}
          <Button variant="default" className="mt-4 w-full bg-primary hover:bg-primary/90" asChild>
              <Link href="/opportunities">Manage Opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
