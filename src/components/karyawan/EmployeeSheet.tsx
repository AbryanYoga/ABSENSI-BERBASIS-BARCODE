"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createKaryawan, updateKaryawan, KaryawanData } from "@/actions/karyawan";
import { UserPlus, Sparkles, Loader2 } from "lucide-react";

interface EmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: KaryawanData | null;
  onSuccess: () => void;
}

export function EmployeeSheet({
  open,
  onOpenChange,
  employeeToEdit,
  onSuccess,
}: EmployeeSheetProps) {
  const isEditing = Boolean(employeeToEdit);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (employeeToEdit) {
      setNamaLengkap(employeeToEdit.nama_lengkap);
      setJabatan(employeeToEdit.jabatan);
    } else {
      setNamaLengkap("");
      setJabatan("");
    }
    setErrorMessage("");
  }, [employeeToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !jabatan.trim()) {
      setErrorMessage("Please fill in both full name and role/department.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (isEditing && employeeToEdit) {
        const res = await updateKaryawan(employeeToEdit.id, {
          nama_lengkap: namaLengkap,
          jabatan,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to update employee.");
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await createKaryawan({
          nama_lengkap: namaLengkap,
          jabatan,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create employee.");
          setIsSubmitting(false);
          return;
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md bg-white p-6 flex flex-col justify-between">
        <div>
          <SheetHeader className="text-left pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#006b5f]/10 text-[#006b5f] flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
              <SheetTitle className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Employee" : "Add New Employee"}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-slate-500">
              {isEditing
                ? "Update personal information and organizational assignment."
                : "Enter employee credentials. A unique optical QR ID token will be generated automatically."}
            </SheetDescription>
          </SheetHeader>

          {errorMessage && (
            <div className="my-4 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {errorMessage}
            </div>
          )}

          <form id="employee-form" onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="nama_lengkap" className="text-xs font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="nama_lengkap"
                placeholder="e.g. Sarah Jenkins"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                className="text-sm bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jabatan" className="text-xs font-semibold text-slate-700">
                Role & Department <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="jabatan"
                placeholder="e.g. Lead Systems Engineer • SecOps"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                required
                className="text-sm bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>

            {/* Unique QR ID Information */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-[#006b5f]" />
                <span>Optical QR Identifier</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isEditing ? (
                  <>Current Token: <code className="font-mono text-slate-800 font-semibold bg-white px-1 py-0.5 border border-slate-200 rounded">{employeeToEdit?.qr_code_id}</code></>
                ) : (
                  "Unique token (e.g. ATS-9942-XF90) is assigned instantly upon registration and embedded in physical/mobile badges."
                )}
              </p>
            </div>
          </form>
        </div>

        <SheetFooter className="border-t border-slate-100 pt-4 flex sm:justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="employee-form"
            disabled={isSubmitting}
            className="bg-[#006b5f] hover:bg-[#00544a] text-white font-medium shadow-xs"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Employee"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
