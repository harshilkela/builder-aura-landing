import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

export default function BudgetPlanner() {
  return (
    <DashboardLayout
      title="Budget Planner"
      action={
        <Button className="bg-finport-green hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-finport-green" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Budget Management
            </h2>
            <h3 className="text-lg font-medium text-gray-800">
              Budget Planning Coming Soon
            </h3>
            <p className="text-gray-600">
              Set monthly budgets and get alerts when you're approaching limits.
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
