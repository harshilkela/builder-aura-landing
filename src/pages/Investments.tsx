import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";

export default function Investments() {
  return (
    <DashboardLayout
      title="Investment Tracker"
      action={
        <Button className="bg-finport-green hover:bg-green-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Portfolio Overview
            </h2>
            <h3 className="text-lg font-medium text-gray-800">
              Investment Tracking Coming Soon
            </h3>
            <p className="text-gray-600">
              Track stocks, mutual funds, crypto, and other investments.
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
