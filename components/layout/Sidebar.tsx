"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, ClipboardCheck, AlertTriangle,
  Target, Package, Layers, FileText, Users, BarChart3,
  ChevronDown, Bird, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard",           icon: LayoutDashboard, label: "Dashboard Ejecutivo", badge: null },
    ],
  },
  {
    section: "Operaciones",
    items: [
      { href: "/dashboard/granjas",       icon: Building2,      label: "Granjas",       badge: "27" },
      { href: "/dashboard/lotes",         icon: Layers,         label: "Lotes",         badge: null },
      { href: "/dashboard/inventario",    icon: Package,        label: "Inventario",    badge: null },
    ],
  },
  {
    section: "Auditoría & Control",
    items: [
      { href: "/dashboard/auditorias",  icon: ClipboardCheck, label: "Auditorías",    badge: "4" },
      { href: "/dashboard/hallazgos",   icon: AlertTriangle,  label: "Hallazgos",     badge: "123" },
      { href: "/dashboard/kpis",        icon: Target,         label: "Planes de Acción KPI", badge: "98" },
    ],
  },
  {
    section: "Gestión",
    items: [
      { href: "/dashboard/documentos",  icon: FileText,       label: "Documentos",    badge: null },
      { href: "/dashboard/informes",    icon: BarChart3,      label: "Informes",      badge: null },
      { href: "/dashboard/usuarios",    icon: Users,          label: "Usuarios",      badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "flex flex-col h-full bg-slate-900 text-slate-100 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-slate-700/50",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex items-center justify-center w-9 h-9 bg-brand-600 rounded-xl flex-shrink-0">
          <Bird className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">AviaGuard</p>
            <p className="text-xs text-slate-400">Savicol · Control Interno</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map((section) => (
          <div key={section.section} className="mb-5">
            {!collapsed && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
                {section.section}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5",
                    active
                      ? "bg-brand-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                          active ? "bg-brand-500 text-white" : "bg-slate-700 text-slate-300"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              MD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">Michael Durán</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <Shield className="w-3.5 h-3.5 text-brand-400" />
          </div>
        </div>
      )}
    </aside>
  );
}
