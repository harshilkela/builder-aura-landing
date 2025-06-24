import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Salary",
    description: "Salary • 2024-01-19",
    amount: 4200,
    date: "2024-01-19",
  },
  {
    id: "2",
    type: "expense",
    category: "Food",
    description: "Grocery Shopping",
    amount: 160,
    date: "2024-01-18",
  },
  {
    id: "3",
    type: "expense",
    category: "Utilities",
    description: "Electric Bill",
    amount: 85,
    date: "2024-01-17",
  },
  {
    id: "4",
    type: "income",
    category: "Freelance",
    description: "Freelance Project",
    amount: 800,
    date: "2024-01-16",
  },
  {
    id: "5",
    type: "expense",
    category: "Transportation",
    description: "Gas Station",
    amount: 45,
    date: "2024-01-15",
  },
];

export default function RecentTransactions() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h3>
        <button className="text-sm text-finport-teal hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {transaction.type === "income" ? (
                  <ArrowUpCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.category}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}$
                {transaction.amount.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
