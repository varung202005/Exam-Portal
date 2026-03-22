import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-4 border-b border-border px-4 lg:px-6 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {user?.name?.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 animate-fade-in overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
