
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Sidebar, 
    SidebarHeader, 
    SidebarContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, // This is now the simplified button
    SidebarFooter, 
    SidebarTrigger 
} from '@/components/ui/sidebar';
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from '@/components/ui/tooltip';
import { LayoutDashboard, Users, Phone, Briefcase, Settings, Building, LogOut, ListChecks } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    // TooltipProvider needs to wrap components that use Tooltips
    <TooltipProvider delayDuration={0}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary group-data-[collapsible=icon]:hidden">
            <Building className="h-7 w-7" />
            <span className="font-headline text-xl font-semibold">Visionarius</span>
          </Link>
          <SidebarTrigger className="hidden md:flex group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>

        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href} asChild>
                      <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        className="justify-start"
                      >
                        {/* Children are now passed directly, wrapped in a single span for safety */}
                        <span className="flex items-center gap-2">
                           <item.icon className="h-5 w-5" />
                           <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </span>
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings" asChild>
                    <SidebarMenuButton
                      className="justify-start"
                      isActive={pathname === '/settings'}
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Settings
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* LogOut button doesn't use Link, so SidebarMenuButton gets onClick directly */}
                  <SidebarMenuButton
                    onClick={signOut}
                    className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
                    </span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Log Out
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
};

export default AppSidebar;
