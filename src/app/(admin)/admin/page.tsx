import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Wifi, 
  ExternalLink, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Workforce Telemetry • Live Sync</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Attendance Overview & Terminal Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time optical punch telemetry, gate turnstile status, and operational attendance flow.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end text-right px-3 py-1.5 bg-white rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-800">Sunday, Sep 20, 2026</span>
            <span className="text-[10px] text-slate-400">Terminal Cam-01</span>
          </div>
          <Link href="/kiosk">
            <Button className="bg-[#006b5f] hover:bg-[#00544a] text-white gap-2 font-medium shadow-2xs h-10 px-4">
              <span>Quick Scan Mode (Open Kiosk)</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards (Flat clean design, no nested cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Present Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">142</span>
            <span className="text-xs text-slate-500 font-medium">/ 156 employees</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>91.0% Rate (+2.4% vs last week)</span>
          </div>
        </div>

        {/* Card 2: On-Time Arrivals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On-Time Arrivals</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">126</span>
            <span className="text-xs text-slate-500 font-medium">checked in</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-blue-600 font-medium">
            <span>88.7% Punctuality (Target 85%)</span>
          </div>
        </div>

        {/* Card 3: Late Arrivals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Late Arrivals</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">16</span>
            <span className="text-xs text-rose-600 font-medium">flagged today</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Delay: 14m</span>
            <span className="text-rose-600 font-medium">3 pending review</span>
          </div>
        </div>

        {/* Card 4: Active Kiosk Scanners */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Kiosks</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">4 / 4</span>
            <span className="text-xs text-emerald-600 font-medium">online</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
            <span>100% Operational (Ping: 12ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
