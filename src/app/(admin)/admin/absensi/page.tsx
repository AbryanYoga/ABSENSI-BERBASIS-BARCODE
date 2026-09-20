import { Button } from "@/components/ui/button";
import { Download, Printer, CalendarCheck, Calendar } from "lucide-react";

export default function AttendanceLogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Attendance Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time optical punch telemetry and shift compliance tracking across facility gates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9">
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9">
            <Printer className="w-4 h-4 mr-1.5 text-slate-500" />
            Print Log
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scans Today</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">128</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On-Time Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">91.2%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Check-In</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">08:52 <span className="text-xs font-normal text-slate-500">AM</span></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shift Staff</span>
          <div className="text-2xl font-bold text-[#006b5f] mt-1">84 <span className="text-xs font-normal text-slate-500">/ 128</span></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-2xs">
        <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">Attendance Telemetry Ready</p>
        <p className="text-xs text-slate-400 mt-1">Ready for real-time punch table view, date range filters, and daily sync.</p>
      </div>
    </div>
  );
}
