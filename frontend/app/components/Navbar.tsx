"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

const navItems = [
  { name: "Executive Tearsheet", href: "/dashboard" },
  { name: "Experiment Matrix", href: "/experiments" },
  { name: "ROI Simulator", href: "/simulator" },
  { name: "Architecture", href: "/architecture" },
];

export function Navbar({ isMock }: { isMock?: boolean }) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#e2dfdb] bg-[var(--paper-bg)]/90 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-serif font-bold text-base tracking-tight text-[#1c1b1a]">
            CausalPulse<span className="text-[#b45309]">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-[#73706c]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "transition-colors pb-1 border-b-2",
                    isActive ? "border-[#1c1b1a] text-[#1c1b1a] font-semibold" : "border-transparent hover:text-[#1c1b1a]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isMock && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-300 text-[10px]">
              Demo Data Mode
            </span>
          )}
          <span className="text-[#73706c] hidden sm:inline">{timeStr} UTC</span>
        </div>
      </div>
    </header>
  );
}
