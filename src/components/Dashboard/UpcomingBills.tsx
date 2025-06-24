import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue" | "paid";
}

const bills: Bill[] = [
  {
    id: "1",
    name: "Rent",
    amount: 1200,
    dueDate: "Due Jan 31",
    status: "pending",
  },
  {
    id: "2",
    name: "Internet",
    amount: 60,
    dueDate: "Due Feb 5",
    status: "overdue",
  },
  {
    id: "3",
    name: "Phone",
    amount: 45,
    dueDate: "Due Feb 8",
    status: "paid",
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    label: "pending",
  },
  overdue: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "overdue",
  },
  paid: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "paid",
  },
};

export default function UpcomingBills() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Bills</h3>
        <button className="text-sm bg-finport-green text-white px-3 py-1 rounded-md hover:bg-green-600">
          Pay Bills
        </button>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => {
          const config = statusConfig[bill.status];
          const Icon = config.icon;

          return (
            <div
              key={bill.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{bill.name}</p>
                  <p className="text-sm text-gray-500">{bill.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${bill.amount.toLocaleString()}
                </p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} capitalize`}
                >
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
