import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/10 text-warning border-warning/30",
  open: "bg-primary/10 text-primary border-primary/30",
  approved: "bg-primary/10 text-primary border-primary/30",
  submitted: "bg-primary/10 text-primary border-primary/30",
  confirmed: "bg-primary/10 text-primary border-primary/30",
  partial: "bg-warning/10 text-warning border-warning/30",
  partiallyreceived: "bg-warning/10 text-warning border-warning/30",
  received: "bg-success/10 text-success border-success/30",
  completed: "bg-success/10 text-success border-success/30",
  closed: "bg-success/10 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  canceled: "bg-destructive/10 text-destructive border-destructive/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ value }: { value?: string | null }) {
  const label = String(value ?? "Unknown");
  const key = label.toLowerCase().replace(/[\s_-]/g, "");
  const cls = map[key] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full border px-2 py-0 text-[11px] font-medium", cls)}
    >
      {label}
    </Badge>
  );
}
