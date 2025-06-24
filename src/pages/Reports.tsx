import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, Calendar, FileText } from "lucide-react";

export default function Reports() {
  return (
    <DashboardLayout
      title="Financial Reports"
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Select Period
          </Button>
          <Button className="bg-finport-green hover:bg-green-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Report Generation
            </h2>
            <h3 className="text-lg font-medium text-gray-800">
              Reports Coming Soon
            </h3>
            <p className="text-gray-600">
              Generate comprehensive financial reports in PDF and CSV formats.
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
