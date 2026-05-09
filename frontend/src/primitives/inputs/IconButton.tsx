import { cn } from "@/utils/classNames";
import type { IconButtonProps } from "@/types/primitives";

export function IconButton({
  icon,
  label,
  actionId,
  disabled,
  onClick,
  className,
}: IconButtonProps & { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      title={label}
      data-action-id={actionId}
      data-ct-primitive="IconButton"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-8 h-8 rounded border border-[#c4c4c4] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="material-symbols-outlined text-[16px] text-[#6b6b6b]">{icon}</span>
    </button>
  );
}
