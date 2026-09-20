import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, QrCode, Users, Clock, ArrowRight, Scan, Server, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
      {/* Top Header / Brand Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#006b5f] flex items-center justify-center text-white font-bold shadow-xs">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">AttendScan</span>
                <Badge variant="outline" className="text-[11px] font-medium border-slate-300 text-slate-600 bg-slate-50">
                  Enterprise Core
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Biometric & Optical QR Gate Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online • 99.9% Sync</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs">
              Open Live Monitor
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phase 1 Initialized • Enterprise Architecture Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Employee Attendance & <br className="hidden sm:inline" />
            <span className="text-[#006b5f]">QR Optical Verification</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Next-generation enterprise attendance infrastructure designed with flat corporate architecture, 
            instant credential issuance, live turnstile telemetry, and real-time gate synchronization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button className="bg-[#006b5f] hover:bg-[#005249] text-white px-6 h-10 font-medium">
              <QrCode className="w-4 h-4 mr-2" />
              Launch Kiosk Terminal
            </Button>
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 h-10">
              Attendance Logs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Feature telemetry status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
              <Users className="w-4 h-4 text-[#006b5f]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">142</span>
              <span className="text-xs text-slate-500">/ 156</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              91.0% Attendance Rate
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">On-Time Arrival</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">126</span>
              <span className="text-xs text-slate-500">employees</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-blue-600 font-medium">
              88.7% Punctuality Target
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Kiosk Optical Nodes</span>
              <Scan className="w-4 h-4 text-[#006b5f]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">4 / 4</span>
              <span className="text-xs text-slate-500">Online</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
              100% Operational • 12ms ping
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Database & Engine</span>
              <Server className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Prisma ORM</span>
              <span className="text-xs text-slate-500">v7</span>
            </div>
            <div className="mt-3 flex items-center text-xs text-slate-600 font-medium">
              PostgreSQL / SQLite ready
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 text-center">
        AttendScan Enterprise Architecture • Built for Gate Automation & Real-Time Punch Telemetry
      </footer>
    </div>
  );
}
