import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Stethoscope, 
  Brain, 
  Bell, 
  BarChart3,
  LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigation = [
    { 
      name: "Learning", 
      path: "/learning", 
      icon: Brain,
      roles: ["public", "doctor", "admin"]
    },
    { 
      name: "Doctor Dashboard", 
      path: "/doctor", 
      icon: Stethoscope,
      roles: ["doctor", "admin"]
    },
    { 
      name: "Public Display", 
      path: "/display", 
      icon: Bell,
      roles: ["public", "doctor", "admin"]
    },
    { 
      name: "Admin Dashboard", 
      path: "/admin", 
      icon: BarChart3,
      roles: ["admin"]
    },
  ];

  const userRole = user?.role || "public";
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/learning">
            <a className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Rural Health Educators</span>
            </a>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user.role} • Level {user.level}
                  </div>
                </div>
                <Avatar data-testid="avatar-user">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <Button
              asChild
              variant="ghost"
              size="icon"
              data-testid="button-logout"
            >
              <a href="/api/logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {filteredNavigation.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-primary text-primary font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 Rural Health Educators. All rights reserved.</p>
            <p>Emergency: 1800-XXX-XXXX</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
