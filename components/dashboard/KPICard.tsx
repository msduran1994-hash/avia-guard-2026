"use client";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: "blue" | "green" | "orange" | "red" | "purple";
  change?: { value: number; label: string };
  onClick?: () => void;
}

const GRADIENTS = {
  blue:   "from-blue-800 to-blue-500",
  green:  "from-green-800 to-green-500",
  orange: "from-orange-800 to-orange-500",
  red:    "from-red-800 to-red-500",
  purple: "from-purple-800 to-purple-500",
};

export default function KPICard({ title, value, subtitle, icon: Icon, gradient, change, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br shadow-lg",
        GRADIENTS[gradient],
        onClick && "cursor-pointer hover:scale-[1.02] transition-transform"
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              change.value >= 0 ? "bg-white/20 text-white" : "bg-red-400/40 text-white"
            )}>
              {change.value >= 0 ? "+" : ""}{change.value}% {change.label}
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <p className="text-4xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
