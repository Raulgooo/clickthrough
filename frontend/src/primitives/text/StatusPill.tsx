import { cn } from "@/utils/classNames";
import type { StatusPillProps } from "@/types/primitives";

const variantMap: Record<string, { tone?: StatusPillProps["tone"]; pulse?: boolean; dashed?: boolean; hollow?: boolean }> = {
  analyzing: { tone: "neutral", pulse: true },
  streaming: { tone: "neutral" },
  success: { tone: "success" },
  warning: { tone: "warning" },
  error: { tone: "danger" },
  unverified: { tone: "neutral", dashed: true, hollow: true },
  approval: { tone: "info" },
  executing: { tone: "info", pulse: true },
  completed: { tone: "success" },
  private: { tone: "neutral", dashed: true, hollow: true },
};

export function StatusPill({ label, tone: toneProp, icon, className }: StatusPillProps & { className?: string }) {
  const mapped = variantMap[label.toLowerCase()] || {};
  const tone = toneProp || mapped.tone || "neutral";
  const isSuccess = tone === "success";
  const isDanger = tone === "danger";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[4px] px-[4px] py-[4px] rounded-full w-fit font-['JetBrains_Mono'] text-[11px] tracking-wide",
        isSuccess || isDanger ? "bg-[#1b1b1b] text-white" : "bg-[#eeeeee] text-[#6b6b6b]",
        mapped.dashed && "border border-dashed border-[#c4c4c4]",
        className
      )}
      data-ct-primitive="StatusPill"
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          mapped.hollow ? "border border-[#1b1b1b] bg-transparent" : isSuccess || isDanger ? "bg-white" : "bg-[#1b1b1b]",
          mapped.pulse && "animate-[pulse-dot_2s_ease-in-out_infinite]"
        )}
      />
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
