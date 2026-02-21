import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsCardProps {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" };
  chart?: number[];
}

export function MetricsCard({
  label,
  value,
  variant = "default",
  icon,
  trend,
  chart,
}: MetricsCardProps) {
  const colorClasses = {
    default: "text-gray-900",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  const iconBgClasses = {
    default: "bg-blue-50",
    success: "bg-green-50",
    warning: "bg-amber-50",
    danger: "bg-red-50",
  };

  const chartClasses = {
    default: "bg-blue-200",
    success: "bg-green-200",
    warning: "bg-amber-200",
    danger: "bg-red-200",
  };

  const trendColor = trend?.direction === "up" ? "text-green-600" : "text-red-600";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClasses[variant]} ${colorClasses[variant]}`}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[variant]} dark:text-gray-100`}>
        {value}
      </p>

      {chart && chart.length > 0 && (
        <div className="mt-4 flex items-end gap-1 h-12">
          {chart.map((height, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${chartClasses[variant]}`}
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
