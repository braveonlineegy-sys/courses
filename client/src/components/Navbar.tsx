import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isTeacher, logout, isLoggingOut } =
    useAuth();

  const showDropdown = isAuthenticated && (isAdmin || isTeacher);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
          <ShoppingBag className="h-6 w-6" />
          <span>Store</span>
        </Link>

        <nav className="flex items-center gap-6">
      
      <ModeToggle />
      
      
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {showDropdown && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      {user?.name || user?.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to={isAdmin ? "/admin" : "/teacher"}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
