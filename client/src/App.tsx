import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import History from "@/pages/history";
import Analytics from "@/pages/analytics";
import Admin from "@/pages/admin";
import Leads from "@/pages/leads";
import { useEffect } from "react";
import { 
  Phone, 
  Clock, 
  BarChart3, 
  Users, 
  Settings, 
  Headphones 
} from "lucide-react";
import { cn } from "@/lib/utils";

function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Call", icon: Phone },
    { path: "/history", label: "History", icon: Clock },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/leads", label: "Leads", icon: Users },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Headphones className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-semibold text-sidebar-foreground block">
              AI Support
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Voice Assistant
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover-elevate"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">System Online</span>
        </div>
      </div>
    </aside>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/leads" component={Leads} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isCallPage = location === "/";

  return (
    <div className="flex h-screen bg-background">
      {!isCallPage && <Sidebar />}
      <main className={cn("flex-1 overflow-auto", !isCallPage && "bg-muted/30")}>
        <Router />
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
