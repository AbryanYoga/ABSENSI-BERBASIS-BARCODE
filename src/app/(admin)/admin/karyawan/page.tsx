import { Button } from "@/components/ui/button";
import { Plus, Filter, Download, Users, ShieldCheck, QrCode } from "lucide-react";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage staff records, role assignments, and optical QR credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9">
            <Filter className="w-4 h-4 mr-1.5 text-slate-500" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9">
            <Download className="w-4 h-4 mr-1.5 text-slate-500" />
            Export
          </Button>
          <Button size="sm" className="bg-[#006b5f] hover:bg-[#00544a] text-white font-medium h-9 px-3.5">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">248</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Credentials</span>
          <div className="text-2xl font-bold text-[#006b5f] mt-1">241</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passes Pending QR</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">7</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sync Integrity</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
        </div>
      </div>

      {/* Placeholder table container */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-2xs">
        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-700">Employee Management Module Ready</p>
        <p className="text-xs text-slate-400 mt-1">Database and UI layout configured for Phase 4 CRUD & QR generation.</p>
      </div>
    </div>
  );
}
