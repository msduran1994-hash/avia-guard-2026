"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className={cn("hidden lg:flex flex-shrink-0 transition-all duration-300", collapsed ? "w-16" : "w-64")}>
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-slate-200 hover:bg-slate-300 rounded-r-lg items-center justify-center transition-colors"
          style={{ left: collapsed ? "64px" : "256px" }}
        >
          <svg
            className={cn("w-3 h-3 text-slate-600 transition-transform", collapsed ? "rotate-0" : "rotate-180")}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
