import { cn } from "@/lib/cn";
import { CATEGORY_COLORS } from "@/lib/constants";
import { AnimatedBorder } from "./AnimatedBorder";
import type { PostCategory } from "@/lib/types";

interface CategoryPillProps {
  category: PostCategory;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryPill({ category, selected = false, onClick, className }: CategoryPillProps) {
  const Tag = onClick ? "button" : "span";

  const pill = (
    <Tag
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap",
        onClick && "cursor-pointer",
        CATEGORY_COLORS[category],
        selected && "brightness-125",
        className
      )}
    >
      {category}
    </Tag>
  );

  if (selected) {
    return <AnimatedBorder>{pill}</AnimatedBorder>;
  }

  return pill;
}
