"use client";

import { Check, ChevronDown } from "lucide-react";
import { Glass } from "glisse";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface GlassSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  align?: "left" | "right";
  icon?: React.ReactNode;
}

export function GlassSelect({
  options,
  value,
  onChange,
  ariaLabel,
  align = "right",
  icon,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors ${
          open
            ? "border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#38bdf8]"
            : "border-white/12 bg-white/[0.05] text-[#f4f7fb] hover:border-white/20 hover:bg-white/[0.09]"
        }`}
      >
        {icon}
        <span className="max-w-[160px] truncate">{selected?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#8f9bb0] transition-transform duration-150 ${
            open ? "rotate-180 text-[#38bdf8]" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 w-[min(82vw,250px)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <Glass className="max-h-64 w-full overflow-y-auto rounded-2xl p-1.5 shadow-2xl">
            <div className="flex w-full flex-col gap-0.5">
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                        : "text-[#e2e8f0] hover:bg-white/10"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {opt.meta && (
                        <span className="text-[11px] text-[#8f9bb0]">
                          {opt.meta}
                        </span>
                      )}
                      {active && <Check className="h-3.5 w-3.5 text-[#38bdf8]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Glass>
        </div>
      )}
    </div>
  );
}
