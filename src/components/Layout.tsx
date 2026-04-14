import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import {
  ClipboardList,
  BarChart2,
  Menu,
  X,
  Moon,
  Home,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: ROUTE_PATHS.HOME, label: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.QUESTIONNAIRE, label: 'Remplir un questionnaire', icon: ClipboardList },
  { path: ROUTE_PATHS.DASHBOARD, label: 'Tableau de bord', icon: BarChart2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar fixed top-0 left-0 h-screen z-20">
        <SidebarContent currentPath={location.pathname} />
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-border z-40 transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent currentPath={location.pathname} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header className="md:hidden sticky top-0 z-20 bg-background border-b border-border flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm text-foreground">Sommeil — Suivi Intégration</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPath,
  onClose,
}: {
  currentPath: string;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Header sidebar */}
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Moon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-tight">Médecine du Sommeil</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Suivi Post-Intégration</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors md:hidden">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Cabinet de Médecine du Sommeil<br />
          Usage interne — Données confidentielles
        </p>
      </div>
    </>
  );
}
