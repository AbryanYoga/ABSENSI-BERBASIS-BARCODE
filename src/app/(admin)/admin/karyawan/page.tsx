"use client";

import { useState, useEffect, useMemo } from "react";
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
import { EmployeeSheet } from "@/components/karyawan/EmployeeSheet";
import { DeleteEmployeeDialog } from "@/components/karyawan/DeleteEmployeeDialog";
import { QrCodeDialog } from "@/components/karyawan/QrCodeDialog";
import { getKaryawans, KaryawanData } from "@/actions/karyawan";
import {
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Edit2,
  Trash2,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<KaryawanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal dialog states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<KaryawanData | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<KaryawanData | null>(null);

  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedEmployeeForQr, setSelectedEmployeeForQr] = useState<KaryawanData | null>(null);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await getKaryawans();
      if (res.success && res.data) {
        setEmployees(res.data as KaryawanData[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenAdd = () => {
    setSelectedEmployeeForEdit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (emp: KaryawanData) => {
    setSelectedEmployeeForEdit(emp);
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (emp: KaryawanData) => {
    setSelectedEmployeeForDelete(emp);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenQr = (emp: KaryawanData) => {
    setSelectedEmployeeForQr(emp);
    setIsQrDialogOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.nama_lengkap.toLowerCase().includes(q) ||
        emp.jabatan.toLowerCase().includes(q) ||
        emp.qr_code_id.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage staff records, role assignments, and optical QR credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, role, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-60 sm:w-72 h-9 text-xs bg-white border-slate-200"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-medium"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Filter
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const headers = "ID,Name,Role,QR_Code_ID\n";
              const rows = employees.map(e => `"${e.id}","${e.nama_lengkap}","${e.jabatan}","${e.qr_code_id}"`).join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-9 font-medium"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-[#006b5f] hover:bg-[#00544a] text-white font-medium h-9 px-3.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Top Metrics Row (Flat design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Headcount
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{employees.length}</span>
            <span className="text-[11px] text-emerald-600 font-medium">+12 this mo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Credentials
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#006b5f]">{employees.length}</span>
            <span className="text-[11px] text-teal-700 font-medium">100% active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Passes Pending QR
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-700">0</span>
            <span className="text-[11px] text-slate-400 font-medium">All assigned</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sync Integrity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">100%</span>
            <span className="text-[11px] text-emerald-600 font-medium">Synced</span>
          </div>
        </div>
      </div>

      {/* Full-width Flat Data Table (Shadcn Table) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200">
            <TableRow>
              <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Employee ID
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Staff Member
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Role & Department
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5">
                Credential Status
              </TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#006b5f]" />
                    <span className="text-xs">Loading employee directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-medium text-slate-600">No employees found</span>
                    <span className="text-xs text-slate-400">Click &quot;Add New Employee&quot; to create your first record.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => {
                const initials = getInitials(emp.nama_lengkap);
                const mockEmail = `${emp.nama_lengkap.toLowerCase().replace(/[^a-z0-9]/g, ".")}@company.com`;
                return (
                  <TableRow
                    key={emp.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* ID Column */}
                    <TableCell className="font-mono text-xs font-semibold py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100/90 text-slate-700 border border-slate-200/60">
                        <span>{emp.qr_code_id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(emp.qr_code_id)}
                          title="Copy ID"
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {copiedId === emp.qr_code_id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Staff Member Column */}
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900 leading-tight">
                            {emp.nama_lengkap}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {mockEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Department Column */}
                    <TableCell className="py-3.5">
                      <span className="text-xs font-medium text-slate-700">
                        {emp.jabatan}
                      </span>
                    </TableCell>

                    {/* Credential Status Column */}
                    <TableCell className="py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active Pass</span>
                      </div>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View QR Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenQr(emp)}
                          className="h-8 px-2.5 text-xs font-medium border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-[#006b5f] hover:border-teal-300 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1 text-[#006b5f]" />
                          View QR
                        </Button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit Employee"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(emp)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Showing 1-{filteredEmployees.length} of {employees.length} records
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

      {/* Right-side Sheet: Add / Edit Employee */}
      <EmployeeSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        employeeToEdit={selectedEmployeeForEdit}
        onSuccess={loadEmployees}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteEmployeeDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={selectedEmployeeForDelete}
        onSuccess={loadEmployees}
      />

      {/* View QR / Digital Credential Dialog */}
      <QrCodeDialog
        open={isQrDialogOpen}
        onOpenChange={setIsQrDialogOpen}
        employee={selectedEmployeeForQr}
        onUpdated={loadEmployees}
      />
    </div>
  );
}
