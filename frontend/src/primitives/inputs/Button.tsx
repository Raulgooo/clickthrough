import { cn } from "@/utils/classNames";
import type { ButtonProps } from "@/types/primitives";

export function Button({
  label,
  variant = "primary",
  icon,
  actionId,
  disabled,
  loading,
  onClick,
  className,
}: ButtonProps & { loading?: boolean; onClick?: () => void; className?: string }) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      data-action-id={actionId}
      data-ct-primitive="Button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "px-[12px] py-[4px] rounded-[0.25rem] font-['JetBrains_Mono'] text-[11px] transition-all inline-flex items-center gap-[4px]",
        variant === "primary" && "bg-[#000000] text-white border border-[#000000] hover:bg-[#303030]",
        variant === "secondary" && "bg-white text-[#1b1b1b] border border-[#c4c4c4] hover:bg-[#e8e8e8]",
        variant === "ghost" && "bg-transparent text-[#6b6b6b] hover:bg-[#e8e8e8]",
        variant === "danger" && "bg-[#ba1a1a] text-white border border-[#ba1a1a] hover:opacity-90",
        isDisabled && "opacity-50 cursor-not-allowed",
        loading && "opacity-70 cursor-wait",
        className
      )}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
      ) : (
        icon && <span className="material-symbols-outlined text-[16px]">{icon}</span>
      )}
      {loading ? "Loading..." : label}
    </button>
  );
}
