import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { ClipboardList, Menu, X, Moon, Home, Settings } from 'lucide-react';

// Dashboard est accessible uniquement depuis l'admin — retiré du nav public
const NAV_ITEMS = [
  { path: ROUTE_PATHS.HOME, label: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.QUESTIONNAIRE, label: 'Remplir un questionnaire', icon: ClipboardList },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar fixed top-0 left-0 h-screen z-20">
        <SidebarContent currentPath={location.pathname} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-border z-40 transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent currentPath={location.pathname} onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-20 bg-background border-b border-border flex items-center gap-3 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
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

function SidebarContent({ currentPath, onClose }: { currentPath: string; onClose?: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Moon className="w-4.5 h-4.5 text-primary-foreground" />
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

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
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

      {/* Section admin séparée */}
      <div className="px-3 pb-4">
        <div className="h-px bg-border mb-3" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">Administration</p>
        <NavLink
          to={ROUTE_PATHS.ADMIN}
          onClick={onClose}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            currentPath === ROUTE_PATHS.ADMIN || currentPath === ROUTE_PATHS.DASHBOARD
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Espace Admin
        </NavLink>
      </div>

      <div className="px-5 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          Usage interne · Données confidentielles
        </p>
      </div>
    </>
  );
}
