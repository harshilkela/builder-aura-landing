import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  PiggyBank,
  FileText,
  Target,
  Bell,
  Search,
  User,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Income & Expenses",
    href: "/income-expenses",
    icon: DollarSign,
  },
  {
    title: "Budget Planner",
    href: "/budget-planner",
    icon: PiggyBank,
  },
  {
    title: "Investments",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [monthlyGoal] = useState(2000);
  const [currentSavings] = useState(1300);
  const progressPercentage = (currentSavings / monthlyGoal) * 100;

  return (
    <div
      className={cn(
        "w-64 bg-white border-r border-gray-200 flex flex-col",
        className,
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-finport-teal rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FinPort</h1>
            <p className="text-xs text-gray-500">Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions, categories..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-finport-green/20 focus:border-finport-green"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-finport-green text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Monthly Goal Card */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-finport-teal rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Monthly Goal</span>
          </div>
          <div className="text-sm mb-2">
            Save ${monthlyGoal.toLocaleString()}
          </div>

          <div className="bg-white/20 rounded-full h-2 mb-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>

          <div className="text-xs opacity-90">
            ${currentSavings.toLocaleString()} saved (
            {progressPercentage.toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">xyz123</p>
            <p className="text-xs text-gray-500">xyz123@gmail.com</p>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Bell className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
