
import { Button } from "@/components/ui/button";
import { Building2, GitGraph, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    title: "Businesses",
    icon: Building2,
    href: "/businesses",
  },
  {
    title: "Assets",
    icon: GitGraph,
    href: "/assets",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">
            BusinessAssets
          </Link>
          <nav className="flex gap-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
