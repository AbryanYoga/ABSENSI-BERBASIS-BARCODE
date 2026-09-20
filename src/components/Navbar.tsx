"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();

  // Dynamic breadcrumb mapping based on active route
  const getRouteInfo = () => {
    if (pathname.startsWith("/admin/karyawan")) {
      return {
        section: "Enterprise Core",
        page: "Employee Management",
        subtitle: "Manage staff credentials and optical QR tokens",
      };
    }
    if (pathname.startsWith("/admin/absensi")) {
      return {
        section: "Enterprise Core",
        page: "Attendance Logs",
        subtitle: "Real-time punch telemetry and shift compliance",
      };
    }
    if (pathname.startsWith("/admin/settings")) {
      return {
        section: "Enterprise Core",
        page: "System Settings",
        subtitle: "Configure gate operating parameters and scan rules",
      };
    }
    return {
      section: "Enterprise Core",
      page: "Live Monitor & Telemetry",
      subtitle: "Attendance Overview & Terminal Health",
    };
  };

  const routeInfo = getRouteInfo();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Breadcrumbs and Live System Status Badge */}
      <div className="flex items-center gap-3 overflow-hidden">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">{routeInfo.section}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">{routeInfo.page}</span>
        </nav>

        {/* Live sync pill badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal-50 border border-teal-200 text-[#006b5f]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online • 99.9% Sync</span>
        </div>
      </div>

      {/* Right: Quick Search, Utilities, and Admin Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employees, punches, IDs..."
            className="w-64 lg:w-72 pl-9 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell with alert dot */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help / Docs */}
        <button
          type="button"
          aria-label="System Help"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:inline-flex"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Admin Profile Dropdown trigger */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#006b5f] to-teal-400 border border-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
            EV
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              Eleanor Vance
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Chief of HR Operations
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
