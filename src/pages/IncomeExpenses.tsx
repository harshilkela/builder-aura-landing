import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Filter, BarChart3 } from "lucide-react";

export default function IncomeExpenses() {
  return (
    <DashboardLayout
      title="Income & Expenses"
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-finport-green hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Transaction Management
          </h2>

          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-finport-green/20 focus:border-finport-green"
              />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              Transaction Tracker Coming Soon
            </h3>
            <p className="text-gray-600">
              Add, edit, and categorize your income and expenses.
            </p>
            <p className="text-sm text-gray-500">
              This feature will be implemented in the next iteration.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
