
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Phone, Briefcase, Settings, Building, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
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
              <Link href={item.href} asChild>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" asChild>
              <SidebarMenuButton
                asChild
                tooltip={{ children: 'Settings', side: 'right', align: 'center' }}
                className="justify-start"
                isActive={pathname === '/settings'}
              >
                <a>
                  <Settings className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton
                onClick={signOut}
                tooltip={{ children: 'Log Out', side: 'right', align: 'center' }}
                className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
             >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
