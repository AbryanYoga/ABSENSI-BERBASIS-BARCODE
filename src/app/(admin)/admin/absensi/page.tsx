"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAttendanceLogs, getAttendanceStats, AttendanceRecord } from "@/actions/absensi";
import {
  Calendar as CalendarIcon,
  Download,
  Printer,
  RotateCw,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  Users,
  Scan,
  Loader2,
  Check,
} from "lucide-react";

export default function AttendanceLogsPage() {
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [dateFilterPreset, setDateFilterPreset] = useState<"Today" | "Yesterday" | "Last 7 Days" | "This Month" | "Custom">("Today");
  const [customDate, setCustomDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [statusTab, setStatusTab] = useState<"All" | "On Time" | "Late" | "Not Checked Out">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments");

  const loadData = async () => {
    setIsLoading(true);
    try {
      let filterPayload: any = {
        status: statusTab,
        search: searchQuery,
      };

      const now = new Date();
      if (dateFilterPreset === "Today") {
        filterPayload.date = format(now, "yyyy-MM-dd");
      } else if (dateFilterPreset === "Yesterday") {
        filterPayload.date = format(subDays(now, 1), "yyyy-MM-dd");
      } else if (dateFilterPreset === "Last 7 Days") {
        filterPayload.startDate = format(subDays(now, 7), "yyyy-MM-dd");
        filterPayload.endDate = format(now, "yyyy-MM-dd");
      } else if (dateFilterPreset === "This Month") {
        filterPayload.startDate = format(startOfMonth(now), "yyyy-MM-dd");
        filterPayload.endDate = format(now, "yyyy-MM-dd");
      } else if (dateFilterPreset === "Custom") {
        filterPayload.date = customDate;
      }

      const [logsRes, statsRes] = await Promise.all([
        getAttendanceLogs(filterPayload),
        getAttendanceStats(filterPayload.date || format(now, "yyyy-MM-dd")),
      ]);

      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateFilterPreset, customDate, statusTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = "Employee Name,Employee ID,Role,Date,Time In,Time Out,Status,Terminal\n";
    const rows = filteredLogs.map((log) => {
      const dateStr = format(new Date(log.tanggal), "yyyy-MM-dd");
      const timeInStr = log.waktu_masuk ? format(new Date(log.waktu_masuk), "hh:mm a") : "-";
      const timeOutStr = log.waktu_pulang ? format(new Date(log.waktu_pulang), "hh:mm a") : "In Progress";
      return `"${log.karyawan.nama_lengkap}","${log.karyawan.qr_code_id}","${log.karyawan.jabatan}","${dateStr}","${timeInStr}","${timeOutStr}","${log.status_masuk}","${log.terminal || "Main Gate"}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          log.karyawan.nama_lengkap.toLowerCase().includes(q) ||
          log.karyawan.qr_code_id.toLowerCase().includes(q) ||
          log.karyawan.jabatan.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Department filter
      if (selectedDepartment !== "All Departments") {
        if (!log.karyawan.jabatan.toLowerCase().includes(selectedDepartment.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [logs, searchQuery, selectedDepartment]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Render Status Badge strictly following the Stitch UI mockup
  const renderStatusBadge = (log: AttendanceRecord) => {
    if (log.status_masuk === "Tepat Waktu" || log.status_masuk === "On Time") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>On Time</span>
        </span>
      );
    }

    if (log.status_masuk === "Terlambat" || log.status_masuk === "Late") {
      const delayLabel = log.deviationMinutes && log.deviationMinutes > 0 ? ` (+${log.deviationMinutes}m)` : " (+15m)";
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Late{delayLabel}</span>
        </span>
      );
    }

    if (!log.waktu_pulang && log.waktu_masuk) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Not Checked Out</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Alpha</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Attendance Logs
            </h1>
            <Badge variant="outline" className="text-[11px] font-medium border-teal-200 bg-teal-50 text-[#006b5f] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time optical punch telemetry and shift compliance tracking across facility gates.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-medium shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-medium shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print Log
          </Button>
        </div>
      </div>

      {/* 4 Summary Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans Today</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Scan className="w-4 h-4 text-[#006b5f]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {stats?.totalScansToday ?? 128}
            </span>
            <span className="text-xs text-emerald-600 font-medium">+6.2% vs avg</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On-Time Rate</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {stats?.onTimeRate ?? "91.2%"}
            </span>
            <span className="text-xs text-slate-400 font-medium">Target: 90.0%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Check-In</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {stats?.averageCheckIn ?? "08:52"}
            </span>
            <span className="text-xs text-slate-400 font-medium">AM (Std: 08:00)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shift Staff</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#006b5f] tracking-tight">
              {stats?.activeShiftStaff?.split(" ")[0] ?? "84"}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {stats?.activeShiftStaff?.split("/ ")[1] ?? "128"} On-Site
            </span>
          </div>
        </div>
      </div>

      {/* Date Filter Bar & Range Presets */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Date Input Picker */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilterPreset("Custom");
              }}
              className="bg-transparent border-none p-0 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Quick Date Range Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            {(["Today", "Yesterday", "Last 7 Days", "This Month"] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDateFilterPreset(preset)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  dateFilterPreset === preset
                    ? "bg-[#006b5f] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Right side: Department dropdown & Refresh action */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-8 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="All Departments">All Departments</option>
            <option value="SecOps">SecOps</option>
            <option value="UX Core">UX Core</option>
            <option value="People Ops">People Ops</option>
            <option value="Operations">Operations</option>
            <option value="Engineering">Engineering</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-slate-800"
            title="Refresh logs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#006b5f]" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "All", label: "All", count: stats?.counts?.all ?? logs.length },
            { key: "On Time", label: "On Time", count: stats?.counts?.onTime ?? 0 },
            { key: "Late", label: "Late", count: stats?.counts?.late ?? 0 },
            { key: "Not Checked Out", label: "Not Checked Out", count: stats?.counts?.notCheckedOut ?? 0 },
          ].map((tab) => {
            const isActive = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#006b5f] text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Filter logs by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full md:w-72 h-8.5 text-xs bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Flat Data Table (Shadcn Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Employee Name
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Date
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Time In
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Time Out
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Terminal / Gate
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5 pr-6">
                Audit
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#006b5f]" />
                    <span className="text-xs">Loading attendance telemetry records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-medium text-slate-600">No attendance records found</span>
                    <span className="text-xs text-slate-400">Adjust your date filter or scan a QR badge in the Kiosk terminal.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const initials = getInitials(log.karyawan.nama_lengkap);
                const formattedDate = format(new Date(log.tanggal), "MMM dd, yyyy");
                const formattedTimeIn = log.waktu_masuk
                  ? format(new Date(log.waktu_masuk), "hh:mm a")
                  : "-";
                const formattedTimeOut = log.waktu_pulang
                  ? format(new Date(log.waktu_pulang), "hh:mm a")
                  : "— In Progress";

                return (
                  <TableRow
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Employee Name */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900 leading-tight">
                            {log.karyawan.nama_lengkap}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {log.karyawan.qr_code_id} • {log.karyawan.jabatan.split("•")[0]?.trim()}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3.5 text-xs text-slate-700 font-medium">
                      {formattedDate}
                    </TableCell>

                    {/* Time In */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-800">
                        {log.status_masuk === "Terlambat" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{formattedTimeIn}</span>
                      </div>
                    </TableCell>

                    {/* Time Out */}
                    <TableCell className="py-3.5 text-xs font-mono text-slate-600">
                      <span className={log.waktu_pulang ? "text-slate-800 font-medium" : "italic text-slate-400"}>
                        {formattedTimeOut}
                      </span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3.5">
                      {renderStatusBadge(log)}
                    </TableCell>

                    {/* Terminal / Gate */}
                    <TableCell className="py-3.5 text-xs text-slate-600">
                      {log.terminal || "Gate A Optical Kiosk"}
                    </TableCell>

                    {/* Audit History Action */}
                    <TableCell className="py-3.5 text-right pr-6">
                      <button
                        type="button"
                        title="View Punch Audit Log"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Showing 1 to {filteredLogs.length} of {stats?.counts?.all ?? filteredLogs.length} entries
          </span>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <button
              type="button"
              disabled
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-xs"
            >
              &lt;
            </button>
            <button
              type="button"
              className="px-2.5 py-1 rounded border border-[#006b5f] bg-[#006b5f] text-white font-medium text-xs"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed text-xs"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
