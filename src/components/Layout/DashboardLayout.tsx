import React, { ReactNode } from "react";
import { Bell, Search, User } from "lucide-react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export default function DashboardLayout({
  children,
  title,
  action,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {title === "Dashboard" &&
                      "Welcome back! Here's your financial overview."}
                    {title === "Income & Expenses" &&
                      "Track and manage your financial transactions."}
                    {title === "Budget Planner" &&
                      "Set and track your monthly spending goals."}
                    {title === "Investment Tracker" &&
                      "Monitor your portfolio performance and growth."}
                    {title === "Financial Reports" &&
                      "Generate and export detailed financial reports."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {action}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>This Month</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">xyz123</p>
                  <p className="text-gray-500">xyz123@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
