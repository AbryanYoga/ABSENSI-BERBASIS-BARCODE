"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Scan, 
  Maximize2,
  LogOut,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Employees",
      href: "/admin/karyawan",
      icon: Users,
      active: pathname.startsWith("/admin/karyawan"),
    },
    {
      label: "Attendance",
      href: "/admin/absensi",
      icon: CalendarCheck,
      active: pathname.startsWith("/admin/absensi"),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Top Section: Brand Header & Navigation */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#006b5f] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Scan className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">
                  AttendScan
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Enterprise Core
                </span>
              </div>
            )}
          </Link>

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={onToggle}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Category Label */}
        <div className="px-4 pt-6 pb-2">
          {!isCollapsed ? (
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Operations
            </p>
          ) : (
            <div className="w-4 h-0.5 bg-slate-200 mx-auto" />
          )}
        </div>

        {/* Menu Navigation Links */}
        <nav className="flex flex-col gap-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  item.active
                    ? "bg-[#006b5f] text-white font-medium shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    item.active ? "text-white" : "text-slate-400"
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Quick Scan Action & Admin Profile */}
      <div className="flex flex-col border-t border-slate-100 p-3 gap-2 bg-white">
        {/* Switch to Kiosk Button */}
        <Link
          href="/kiosk"
          title="Switch to Kiosk Scanner Terminal"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors ${
            isCollapsed ? "justify-center px-2" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Maximize2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {!isCollapsed && <span className="truncate">Switch to Kiosk</span>}
          </div>
          {!isCollapsed && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
        </Link>

        {/* Mini Gateway / Admin Profile info */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-slate-700 shrink-0">
                EV
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  Eleanor Vance
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  HR Operations Desk
                </span>
              </div>
            </div>
            <Link
              href="/"
              title="Return to Home"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex justify-center pt-1">
            <div
              title="Eleanor Vance (HR Operations)"
              className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-slate-700 shrink-0 cursor-pointer"
            >
              EV
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
