import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border/60 px-6 pb-5 pt-6 md:px-8 md:pt-8">
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-semibold tracking-tight md:text-[26px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>;
}
