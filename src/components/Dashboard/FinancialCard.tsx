import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface FinancialCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: "income" | "expenses" | "savings" | "networth";
  className?: string;
}

const iconMap = {
  income: TrendingUp,
  expenses: TrendingDown,
  savings: Percent,
  networth: DollarSign,
};

const iconColors = {
  income: "text-green-600",
  expenses: "text-red-600",
  savings: "text-blue-600",
  networth: "text-purple-600",
};

export default function FinancialCard({
  title,
  value,
  change,
  changeType,
  icon,
  className,
}: FinancialCardProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-6 border border-gray-200",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon className={cn("w-5 h-5", iconColors[icon])} />
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center space-x-1">
          {changeType === "positive" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive" ? "text-green-600" : "text-red-600",
            )}
          >
            {change}
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </div>
    </div>
  );
}
