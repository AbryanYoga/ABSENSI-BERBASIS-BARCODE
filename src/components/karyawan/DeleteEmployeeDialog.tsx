"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteKaryawan, KaryawanData } from "@/actions/karyawan";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: KaryawanData | null;
  onSuccess: () => void;
}

export function DeleteEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!employee) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const res = await deleteKaryawan(employee.id);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete employee.");
        setIsDeleting(false);
        return;
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white max-w-md p-6 rounded-xl border border-slate-200">
        <AlertDialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <AlertDialogTitle className="text-lg font-bold text-slate-900">
            Revoke & Delete Employee
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently remove{" "}
            <strong className="text-slate-800">{employee.nama_lengkap}</strong> (Token:{" "}
            <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">{employee.qr_code_id}</code>)?
            This will immediately revoke their QR optical credential and permanently purge historical shift punches.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <AlertDialogFooter className="pt-3 gap-2">
          <AlertDialogCancel disabled={isDeleting} className="border-slate-200 text-slate-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Revoke & Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
