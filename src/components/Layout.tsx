import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, Settings, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import SettingsDialog from '@/components/SettingsDialog';
import { useReminders } from '@/hooks/useReminders';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
  }`;

export const Layout = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  useReminders();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Timer className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">桌面番茄日历</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              <Timer className="size-4" /> 今日工作台
            </NavLink>
            <NavLink to="/calendar" className={navClass}>
              <CalendarDays className="size-4" /> 发布日历
            </NavLink>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label="设置"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Toaster position="top-center" richColors />
    </div>
  );
};