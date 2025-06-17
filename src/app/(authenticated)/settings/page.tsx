'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Bell, Palette, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveChanges = (section: string) => {
    toast({
      title: `${section} Settings Saved`,
      description: `Your changes to ${section.toLowerCase()} settings have been saved. (Demo)`,
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account, notification, and application preferences.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" defaultValue={user?.displayName || ''} placeholder="Your Name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={user?.email || ''} disabled placeholder="your.email@example.com" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <Button onClick={() => handleSaveChanges('Profile')}>Save Profile Changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Choose how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive updates and alerts via email.
              </span>
            </Label>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pushNotifications" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get real-time alerts in the app (if supported).
              </span>
            </Label>
            <Switch id="pushNotifications" />
          </div>
          <Separator />
          <div className="space-y-1">
            <Label>Notification Types</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><Switch id="taskAlerts" defaultChecked/> <Label htmlFor="taskAlerts" className="font-normal">Task Reminders</Label></div>
                <div className="flex items-center gap-2"><Switch id="dealUpdates" defaultChecked/> <Label htmlFor="dealUpdates" className="font-normal">Deal Updates</Label></div>
                <div className="flex items-center gap-2"><Switch id="newLeads"/> <Label htmlFor="newLeads" className="font-normal">New Lead Alerts</Label></div>
                <div className="flex items-center gap-2"><Switch id="systemMessages"/> <Label htmlFor="systemMessages" className="font-normal">System Messages</Label></div>
            </div>
          </div>
          <Button onClick={() => handleSaveChanges('Notification')}>Save Notification Preferences</Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Toggle between light and dark themes. (Theme switching not fully implemented)
                </span>
                </Label>
                <Switch id="darkMode" onCheckedChange={(checked) => {
                    document.documentElement.classList.toggle('dark', checked);
                    toast({title: "Theme Changed", description: `Switched to ${checked ? 'Dark' : 'Light'} mode.`})
                }} />
            </div>
             <Button onClick={() => handleSaveChanges('Appearance')}>Save Appearance Settings</Button>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <p className="text-sm text-muted-foreground">Two-factor authentication (2FA) settings would appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
