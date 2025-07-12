import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Users,
  Search,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Shield,
  Bell,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      icon: Users,
      label: "Dashboard",
      path: "/dashboard",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Search,
      label: "Discover",
      path: "/browse",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: MessageSquare,
      label: "Swaps",
      path: "/swap-requests",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  if (user?.role === "admin") {
    navigationItems.push({
      icon: Shield,
      label: "Admin",
      path: "/admin",
      gradient: "from-violet-600 to-purple-600",
    });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-colors duration-500">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text-purple">
                  SkillSwap
                </h1>
                <p className="text-xs text-gray-500 dark:text-purple-200 -mt-1">
                  Connect & Learn
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`
                      relative overflow-hidden group transition-all duration-300
                      ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40`
                          : "hover:bg-white/60 backdrop-blur-sm border border-white/30 hover:shadow-md"
                      }
                    `}
                  >
                    {!isActive && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                      ></div>
                    )}
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:shadow-md group"
              >
                <Bell className="h-4 w-4" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></div>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 h-auto p-2 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:shadow-md rounded-2xl group"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white/50 group-hover:ring-purple-400/50 transition-all">
                      <AvatarImage src={user.profilePhoto} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {user.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Badge className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 border-0">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span className="font-medium">
                            {user.rating.toFixed(1)}
                          </span>
                          <span className="text-gray-400">
                            ({user.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Zap className="h-4 w-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-white/20 dark:border-gray-700/50 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4 text-purple-600" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto py-3 space-x-2 scrollbar-hide">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`
                    relative overflow-hidden whitespace-nowrap min-w-fit group
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : "hover:bg-white/60 backdrop-blur-sm border border-white/30"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Action Elements */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/browse")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 rounded-full p-3 group"
          >
            <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
