"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden antialiased">
      {/* Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Content View with strict flat design architecture */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
