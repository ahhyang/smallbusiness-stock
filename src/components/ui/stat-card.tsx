import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "warning" | "danger" | "success";
  className?: string;
};

const variants = {
  default: "bg-white border-slate-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200",
  success: "bg-emerald-50 border-emerald-200",
};

const iconVariants = {
  default: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  danger: "bg-red-100 text-red-600",
  success: "bg-emerald-100 text-emerald-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        variants[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-slate-500">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconVariants[variant],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
