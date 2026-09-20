"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KaryawanData, regenerateEmployeeQr } from "@/actions/karyawan";
import { 
  Scan, 
  Printer, 
  RotateCw, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: KaryawanData | null;
  onUpdated: () => void;
}

export function QrCodeDialog({
  open,
  onOpenChange,
  employee,
  onUpdated,
}: QrCodeDialogProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = async () => {
    if (!confirm("Are you sure you want to regenerate this QR token? Previous badges will be invalidated.")) {
      return;
    }
    setIsRegenerating(true);
    try {
      const res = await regenerateEmployeeQr(employee.id);
      if (res.success) {
        onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md p-6 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="text-left pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#006b5f] flex items-center justify-center shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Digital Credential Badge
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cryptographically signed optical QR token for gate turnstiles
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Physical Badge Preview Card (Printable Target) */}
        <div className="py-2 flex justify-center">
          <div
            ref={badgeRef}
            id="credential-badge-print"
            className="w-full max-w-[320px] rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col items-center text-center space-y-4 relative"
          >
            {/* Badge Brand Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-[#006b5f] flex items-center justify-center text-white">
                  <Scan className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-900 tracking-tight">AttendScan</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-teal-50 text-teal-800 border border-teal-200">
                Access Pass
              </span>
            </div>

            {/* Profile Avatar & Info */}
            <div className="flex flex-col items-center space-y-1">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-[#006b5f] flex items-center justify-center text-slate-700 font-bold text-base shadow-2xs">
                  {getInitials(employee.nama_lengkap)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 pt-1">
                {employee.nama_lengkap}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {employee.jabatan}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                {employee.qr_code_id}
              </p>
            </div>

            {/* QR Code Graphic Frame */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <QRCode
                value={employee.qr_code_id}
                size={140}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 140 140"
              />
            </div>

            {/* Barcode & Token String */}
            <div className="w-full flex flex-col items-center space-y-1">
              <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase font-semibold">
                TOKEN: {employee.qr_code_id}
              </span>

              {/* Simulated 1D Barcode Pattern */}
              <div className="h-6 flex items-center justify-center gap-[2px] opacity-80 py-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${
                      i % 3 === 0
                        ? "w-[2px] bg-slate-900"
                        : i % 5 === 0
                        ? "w-[3px] bg-slate-900"
                        : i % 2 === 0
                        ? "w-[1px] bg-slate-900"
                        : "w-[1.5px] bg-slate-800"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400">* {employee.qr_code_id} *</span>
            </div>

            {/* Micro Badge Footer Metadata */}
            <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-medium text-slate-400 uppercase tracking-tight">
              <span>Issued: 2026-Q3</span>
              <span className="text-emerald-700 font-semibold">RFID Encrypted</span>
              <span>Gate-A Cert</span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="text-xs border-slate-200 text-slate-600 hover:text-slate-900"
          >
            {isRegenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Regenerate QR
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-[#006b5f] hover:bg-[#00544a] text-white text-xs font-medium shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Badge
          </Button>
        </div>
      </DialogContent>

      {/* Print Specific CSS to isolate badge on print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #credential-badge-print, #credential-badge-print * {
            visibility: visible;
          }
          #credential-badge-print {
            position: absolute;
            left: 50%;
            top: 20%;
            transform: translateX(-50%);
            width: 340px !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
        }
      `}</style>
    </Dialog>
  );
}
