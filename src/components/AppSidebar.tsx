import { useAuth } from '@/context/AuthContext';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, BookOpen, LogOut, Trophy, BarChart3, GraduationCap } from 'lucide-react';

const teacherItems = [
  { title: 'Dashboard', url: '/teacher', icon: LayoutDashboard },
  { title: 'Create Exam', url: '/teacher/create', icon: FileText },
];

const studentItems = [
  { title: 'Dashboard', url: '/student', icon: LayoutDashboard },
  { title: 'My Results', url: '/student/results', icon: Trophy },
  { title: 'Performance', url: '/student/performance', icon: BarChart3 },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const items = user?.role === 'teacher' ? teacherItems : studentItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {!collapsed && (
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground">ExamPortal</p>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
                {user?.role === 'teacher' ? 'Teacher Panel' : 'Student Panel'}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Navigation</span>}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!collapsed && user && (
            <div className="px-3 py-2 border-t border-sidebar-border mt-1">
              <p className="text-xs font-medium text-sidebar-foreground/70 truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{user.email}</p>
            </div>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
