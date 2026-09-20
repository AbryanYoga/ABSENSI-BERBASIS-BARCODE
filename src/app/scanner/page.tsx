"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Html5Qrcode } from "html5-qrcode";
import { recordAttendancePunch } from "@/actions/absensi";
import { getKaryawans, KaryawanData } from "@/actions/karyawan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scan,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Camera,
  CameraOff,
  Maximize2,
  Lock,
  Unlock,
  ShieldCheck,
  Wifi,
  Sparkles,
  RotateCw,
  XCircle,
  HelpCircle,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export default function KioskScannerPage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [employees, setEmployees] = useState<KaryawanData[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Scan Result Feedback State
  const [scanResult, setScanResult] = useState<{
    status: "IDLE" | "SUCCESS_ON_TIME" | "SUCCESS_LATE" | "SUCCESS_CHECKOUT" | "ERROR" | "DUPLICATE";
    message: string;
    employee?: KaryawanData;
    time: string;
    deviationMinutes?: number;
    scenario?: string;
  }>({
    status: "IDLE",
    message: "Awaiting credential presentation...",
    time: "",
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTokenRef = useRef<string>("");
  const lastScanTimestampRef = useRef<number>(0);

  // 1. Digital Clock (every second)
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Load known employees for simulator shortcuts
  useEffect(() => {
    getKaryawans().then((res) => {
      if (res.success && res.data) {
        setEmployees(res.data as KaryawanData[]);
      }
    });
  }, []);

  // 3. Initialize / toggle camera using html5-qrcode
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (_) {}
      }

      const html5QrCode = new Html5Qrcode("kiosk-video-viewfinder");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "user" },
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleTokenScan(decodedText);
        },
        () => {
          // Frame error (no QR detected in frame) - ignore
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera init failed:", err);
      setCameraError("Camera unavailable or permission denied. Simulator mode is active.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (_) {}
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    // Attempt camera start on mount
    startCamera();
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // 4. Core Punch Processing Handler
  const handleTokenScan = async (token: string, simulatedHour?: number, simulatedMinute?: number) => {
    if (!token.trim()) return;

    // Debounce rapid continuous frame scans (2.5 second cooldown per same token)
    const nowMs = Date.now();
    if (
      token === lastScannedTokenRef.current &&
      nowMs - lastScanTimestampRef.current < 2500
    ) {
      return;
    }

    lastScannedTokenRef.current = token;
    lastScanTimestampRef.current = nowMs;
    setIsProcessing(true);

    try {
      let customTimeIso: string | undefined = undefined;
      if (simulatedHour !== undefined && simulatedMinute !== undefined) {
        const customDate = new Date();
        customDate.setHours(simulatedHour, simulatedMinute, 0, 0);
        customTimeIso = customDate.toISOString();
      }

      const res = await recordAttendancePunch(token, {
        customTime: customTimeIso,
      });

      const timeStr = format(new Date(), "hh:mm:ss a");

      if (!res.success) {
        if (res.scenario === "DUPLICATE") {
          setScanResult({
            status: "DUPLICATE",
            message: res.message,
            employee: res.karyawan as any,
            time: timeStr,
            scenario: "DUPLICATE",
          });
        } else {
          setScanResult({
            status: "ERROR",
            message: res.message,
            time: timeStr,
          });
        }
        playTone(false);
      } else {
        if (res.scenario === "CHECK_IN") {
          const isLate = res.status === "Terlambat";
          setScanResult({
            status: isLate ? "SUCCESS_LATE" : "SUCCESS_ON_TIME",
            message: res.message,
            employee: res.karyawan as any,
            time: timeStr,
            deviationMinutes: res.deviationMinutes,
            scenario: "CHECK_IN",
          });
        } else if (res.scenario === "CHECK_OUT") {
          setScanResult({
            status: "SUCCESS_CHECKOUT",
            message: res.message,
            employee: res.karyawan as any,
            time: timeStr,
            scenario: "CHECK_OUT",
          });
        }
        playTone(true);
      }
    } catch (error) {
      console.error(error);
      setScanResult({
        status: "ERROR",
        message: "Network or optical decoder error.",
        time: format(new Date(), "hh:mm:ss a"),
      });
      playTone(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Audio-visual chime helper
  const playTone = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = success ? 784 : 260; // G5 for success, C4 for error
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (_) {}
  };

  const getInitials = (name?: string) => {
    if (!name) return "EMP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col justify-between p-4 md:p-6 select-none font-sans antialiased">
      {/* Top Header Bar: Terminal ID & NTP Live Clock */}
      <header className="bg-white rounded-2xl border border-slate-200/80 px-6 py-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-[#006b5f] flex items-center justify-center shrink-0">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm tracking-tight text-slate-900">
                Live Verification Terminal
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold border border-slate-200">
                TERMINAL-01A
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              HQ Entrance North Turnstile • Gate Zone Alpha • Optical Reader ID #9822
            </p>
          </div>
        </div>

        {/* Large Digital Clock (NTP Synchronized) */}
        <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200/90 shrink-0">
          <div className="flex flex-col text-right">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-slate-900 tracking-tight leading-none">
              {currentTime ? format(currentTime, "hh:mm:ss") : "--:--:--"}{" "}
              <span className="text-base md:text-lg font-semibold text-slate-500">
                {currentTime ? format(currentTime, "a") : ""}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-1">
              {currentTime ? format(currentTime, "EEEE, MMMM d, yyyy") : ""}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              Time Protocol
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              NTP Synced
            </span>
          </div>
        </div>
      </header>

      {/* Main Kiosk Viewport: Two Columns */}
      <main className="my-4 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Optical Camera Module HUD (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col space-y-4">
          {/* Sensor Header Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800">Sensor Optical Module</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                60 FPS
              </span>
              <span>• Auto-Focus ON</span>
              <span>• 1080p RGB</span>
            </div>
          </div>

          {/* Centered Square Viewfinder Container */}
          <div className="relative w-full aspect-square max-h-[420px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {/* Real Webcam video mount point */}
            <div
              id="kiosk-video-viewfinder"
              className="absolute inset-0 w-full h-full object-cover z-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            />

            {/* High-tech HUD Overlay Reticle */}
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-8">
              {/* Corner Target Brackets */}
              <div className="w-64 h-64 relative border border-teal-500/30 rounded-xl">
                {/* Top-Left Corner */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-teal-400" />
                {/* Top-Right Corner */}
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-teal-400" />
                {/* Bottom-Left Corner */}
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-teal-400" />
                {/* Bottom-Right Corner */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-teal-400" />

                {/* Animated Horizontal Laser Scanner Line */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce duration-1000 top-1/2" />

                {/* Silhouette / Target Reticle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 text-teal-300">
                  <Scan className="w-16 h-16 stroke-[1.2]" />
                  <span className="text-[10px] font-mono tracking-widest uppercase mt-2">
                    Detecting Subject
                  </span>
                </div>
              </div>

              {/* Viewfinder Telemetry Overlay */}
              <div className="absolute bottom-4 inset-x-6 flex items-center justify-between text-[10px] font-mono text-teal-300/80 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-teal-500/20">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ISO 400 • EXP 1/250s
                </span>
                <span className="font-bold tracking-wider text-emerald-400">
                  QR/BARCODE READY
                </span>
              </div>
            </div>

            {/* If camera is disabled or errored */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <CameraOff className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-300 max-w-xs">
                  {cameraError || "Optical camera is currently paused."}
                </p>
                <Button
                  size="sm"
                  onClick={startCamera}
                  className="bg-[#006b5f] hover:bg-[#00544a] text-white text-xs"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Start Camera Feed
                </Button>
              </div>
            )}
          </div>

          {/* Positioning Guidance Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Badge & Digital QR Positioning</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hold your RFID Employee Card or mobile QR token within the green boundary brackets.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              10–25 cm optimal
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              High contrast mode
            </span>
          </div>
        </div>

        {/* Right Column: Simulation Modes & Live Verification Feedback Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* SIMULATE KIOSK SCAN PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Simulate Kiosk Scan
              </span>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Interactive Testing
              </span>
            </div>

            {/* Quick Simulation Mode Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* Scenario A: On Time Check-In (07:50 AM) */}
              <button
                type="button"
                onClick={() => {
                  const emp = employees[0] || { qr_code_id: "EMP-1042" };
                  handleTokenScan(emp.qr_code_id, 7, 50);
                }}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 transition-colors group cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-bold">On Time</span>
                <span className="text-[10px] text-emerald-600">Morning In</span>
              </button>

              {/* Scenario A: Late Check-In (08:34 AM) */}
              <button
                type="button"
                onClick={() => {
                  const emp = employees[1] || { qr_code_id: "EMP-2084" };
                  handleTokenScan(emp.qr_code_id, 8, 34);
                }}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-800 transition-colors group cursor-pointer"
              >
                <Clock className="w-5 h-5 text-rose-600 mb-1" />
                <span className="text-xs font-bold">Late Entry</span>
                <span className="text-[10px] text-rose-600">+34m Delay</span>
              </button>

              {/* Scenario B: Checked Out (05:05 PM) */}
              <button
                type="button"
                onClick={() => {
                  const emp = employees[0] || { qr_code_id: "EMP-1042" };
                  handleTokenScan(emp.qr_code_id, 17, 5);
                }}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 text-teal-800 transition-colors group cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-[#006b5f] mb-1" />
                <span className="text-xs font-bold">Checked Out</span>
                <span className="text-[10px] text-teal-700">Shift End</span>
              </button>
            </div>

            {/* Quick manual token input or Invalid QR test */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="text"
                placeholder="Scan token (e.g. EMP-1042)..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualToken.trim()) {
                    handleTokenScan(manualToken.trim());
                    setManualToken("");
                  }
                }}
                className="text-xs h-8 bg-slate-50 border-slate-200"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (manualToken.trim()) {
                    handleTokenScan(manualToken.trim());
                    setManualToken("");
                  }
                }}
                className="bg-[#006b5f] hover:bg-[#00544a] text-white text-xs h-8 px-3 shrink-0"
              >
                Simulate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTokenScan("INVALID-TOKEN-999")}
                className="border-slate-200 text-slate-600 text-xs h-8 px-2 shrink-0"
                title="Simulate Invalid QR Token"
              >
                Invalid QR
              </Button>
            </div>
          </div>

          {/* REAL-TIME VERIFICATION FEEDBACK CARD (Matches UI Absen.png) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            {scanResult.status === "IDLE" ? (
              /* Idle state awaiting credential */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Scan className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Awaiting Credential Presentation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Position your badge in front of the optical reader or trigger a simulated scan above.
                  </p>
                </div>
              </div>
            ) : scanResult.status === "ERROR" ? (
              /* Error / Invalid QR feedback */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Access Denied
                  </span>
                  <span className="text-xs font-mono text-slate-400">{scanResult.time}</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 text-center space-y-1">
                  <h3 className="text-base font-bold text-rose-900">Credential Not Recognized</h3>
                  <p className="text-xs text-rose-700">{scanResult.message}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Please consult security reception or present a valid enterprise RFID badge.
                </div>
              </div>
            ) : scanResult.status === "DUPLICATE" ? (
              /* Duplicate Attendance Feedback */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Duplicate Punch Attempt
                  </span>
                  <span className="text-xs font-mono text-slate-400">{scanResult.time}</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-center">
                  <h3 className="text-sm font-bold text-amber-900">Shift Record Complete</h3>
                  <p className="text-xs text-amber-800">{scanResult.message}</p>
                </div>
              </div>
            ) : (
              /* SUCCESS CHECK-IN OR CHECK-OUT */
              <div className="space-y-4">
                {/* Status Pill & Time */}
                <div className="flex items-center justify-between">
                  {scanResult.status === "SUCCESS_ON_TIME" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Verified: Logged In
                    </span>
                  )}
                  {scanResult.status === "SUCCESS_LATE" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Verified: Late Entry
                    </span>
                  )}
                  {scanResult.status === "SUCCESS_CHECKOUT" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <span className="w-2 h-2 rounded-full bg-[#006b5f]" />
                      Verified: Checked Out
                    </span>
                  )}

                  <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    {scanResult.time}
                  </span>
                </div>

                {/* Big Greeting */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {scanResult.status === "SUCCESS_CHECKOUT" ? "Goodbye! Shift Ended" : "Welcome to HQ"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gate identity verified • Optical biometrics matched
                  </p>
                </div>

                {/* Employee Info Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#006b5f] to-teal-400 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                    {getInitials(scanResult.employee?.nama_lengkap)}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {scanResult.employee?.nama_lengkap}
                    </span>
                    <span className="text-xs text-slate-600 truncate font-medium">
                      {scanResult.employee?.jabatan}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                      ID: {scanResult.employee?.qr_code_id} • Keycard RFID #21A
                    </span>
                  </div>
                </div>

                {/* Two Column Grid: Punctuality & Desk Assignment */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Shift Punctuality
                    </span>
                    <div className="font-bold text-slate-800">
                      {scanResult.status === "SUCCESS_ON_TIME" && (
                        <span className="text-emerald-700 font-bold">On Time (-15m)</span>
                      )}
                      {scanResult.status === "SUCCESS_LATE" && (
                        <span className="text-rose-600 font-bold">
                          Late (+{scanResult.deviationMinutes || 34}m)
                        </span>
                      )}
                      {scanResult.status === "SUCCESS_CHECKOUT" && (
                        <span className="text-teal-800 font-bold">Shift Completed</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Target start: 08:00 AM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Desk Assignment
                    </span>
                    <span className="font-bold text-slate-800 block">Studio Floor 4</span>
                    <span className="text-[10px] text-slate-400 block">Pod B-14 (Reserved)</span>
                  </div>
                </div>

                {/* Gate Action Banner (Unlocked) */}
                <div className="p-3 rounded-xl bg-[#006b5f] text-white flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Unlock className="w-4 h-4 text-emerald-300" />
                    <span>Turnstile A-01 Unlocked</span>
                  </div>
                  <span className="text-[11px] text-teal-100 font-mono">
                    Access Granted • 15s
                  </span>
                </div>
              </div>
            )}

            {/* Offline Cache Engine Telemetry */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Offline Cache: 0 Pending Logs • 100% Synced
              </span>
              <span className="font-mono text-slate-400">Latency: 14ms</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="bg-white rounded-2xl border border-slate-200/80 px-6 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const pin = prompt("Enter 6-digit Employee PIN:");
              if (pin) {
                const emp = employees[0];
                if (emp) handleTokenScan(emp.qr_code_id);
              }
            }}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-8 text-xs font-medium"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Forgot Badge? Manual PIN Entry
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Connecting to Security Intercom on Channel 1...")}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 h-8 text-xs font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Security Intercom
          </Button>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mesh Secure LAN 5G</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#006b5f] font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#006b5f]" />
            <span>Admin Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
