import { cn } from "@/lib/cn";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  withSidebar?: boolean;
  withBottomNav?: boolean;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-full",
};

export function PageWrapper({
  children,
  className,
  maxWidth = "md",
  withSidebar = true,
  withBottomNav = true,
}: PageWrapperProps) {
  return (
    <main
      className={cn(
        "min-h-screen w-full",
        withSidebar && "md:pl-60",
        withBottomNav && "pb-24 md:pb-8",
        className
      )}
    >
      <div className={cn("mx-auto px-4 py-6", MAX_WIDTH_MAP[maxWidth])}>
        {children}
      </div>
    </main>
  );
}
