import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-3 py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="size-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-2 text-brand/60">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-black uppercase tracking-wide text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
