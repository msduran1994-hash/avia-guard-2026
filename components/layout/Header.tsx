"use client";
import { useState } from "react";
import { Bell, Menu, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import type { Alert } from "@/components/notifications/NotificationsPanel";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
  actions?: React.ReactNode;
  alerts?: Alert[];
}

export default function Header({ title, subtitle, onToggleSidebar, actions, alerts = [] }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => window.location.reload(), 300);
  };

  const criticalCount = alerts.filter((a) => a.type === "critico").length;
  const totalCount = alerts.length;

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

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {totalCount > 0 && (
              <span className={cn(
                "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1",
                criticalCount > 0 ? "bg-red-500" : "bg-orange-400"
              )}>
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationsPanel
              alerts={alerts}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          MD
        </div>
      </div>
    </header>
  );
}
