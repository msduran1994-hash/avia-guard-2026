"use client";
import { useState } from "react";
import { Search, Bell, Menu, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onToggleSidebar, actions }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={handleRefresh}
          className={cn(
            "p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors",
            refreshing && "animate-spin"
          )}
          title="Actualizar datos"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          MD
        </div>
      </div>
    </header>
  );
}
