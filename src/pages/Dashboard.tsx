import DashboardLayout from "@/components/Layout/DashboardLayout";
import FinancialCard from "@/components/Dashboard/FinancialCard";
import MonthlyChart from "@/components/Dashboard/MonthlyChart";
import ExpenseChart from "@/components/Dashboard/ExpenseChart";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import UpcomingBills from "@/components/Dashboard/UpcomingBills";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Dashboard"
      action={
        <Button className="bg-finport-green hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FinancialCard
            title="Total Income"
            value="$8,450"
            change="+2.5% vs last month"
            changeType="positive"
            icon="income"
          />
          <FinancialCard
            title="Total Expenses"
            value="$6,230"
            change="+5.2% vs last month"
            changeType="negative"
            icon="expenses"
          />
          <FinancialCard
            title="Savings Rate"
            value="26.3%"
            change="+3.1% of total income"
            changeType="positive"
            icon="savings"
          />
          <FinancialCard
            title="Net Worth"
            value="$24,580"
            change="+8.7% vs last quarter"
            changeType="positive"
            icon="networth"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart />
          <ExpenseChart />
        </div>

        {/* Transactions and Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions />
          <UpcomingBills />
        </div>
      </div>
    </DashboardLayout>
  );
}
