import { cn } from "@/utils/classNames";
import type { AlertListProps } from "@/types/primitives";

function toneBorder(tone?: AlertListProps["items"][number]["tone"]) {
  switch (tone) {
    case "danger":
      return "border-l-2 border-error";
    case "warning":
      return "border-l-2 border-warning";
    case "success":
      return "border-l-2 border-success";
    case "info":
    default:
      return "border-l-2 border-primary";
  }
}

function toneText(tone?: AlertListProps["items"][number]["tone"]) {
  switch (tone) {
    case "danger":
      return "text-error";
    case "warning":
      return "text-warning";
    case "success":
      return "text-success";
    case "info":
    default:
      return "text-primary";
  }
}

export function AlertList({
  items,
  className,
}: AlertListProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="AlertList"
      className={cn("space-y-sm", className)}
    >
      {items.map((item, i) => (
        <div key={i} className={cn("pl-md", toneBorder(item.tone))}>
          <p className="font-body-sm text-body-sm text-on-background">
            <strong className={toneText(item.tone)}>
              {item.tone === "danger"
                ? "Discrepancy: "
                : item.tone === "warning"
                ? "Warning: "
                : item.tone === "success"
                ? "Note: "
                : "Info: "}
            </strong>
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}
