"use client";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

export default function Card({ children, className, hover, padding = "md" }: CardProps) {
  const PAD = { sm: "p-4", md: "p-6", lg: "p-8", none: "" };
  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 shadow-sm",
      hover && "card-hover cursor-pointer",
      PAD[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-brand-50 rounded-lg">
            <Icon className="w-5 h-5 text-brand-600" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
