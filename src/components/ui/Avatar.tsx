"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { AURA_LEVELS } from "@/lib/constants";
import type { User } from "@/lib/types";

const SIZE_MAP = {
  xs: { img: 24, class: "size-6", text: "text-[8px]" },
  sm: { img: 32, class: "size-8", text: "text-[10px]" },
  md: { img: 48, class: "size-12", text: "text-sm" },
  lg: { img: 80, class: "size-20", text: "text-xl" },
  xl: { img: 96, class: "size-24", text: "text-2xl" },
};

interface AvatarProps {
  user: Pick<User, "username" | "displayName" | "avatarUrl" | "level">;
  size?: keyof typeof SIZE_MAP;
  showRing?: boolean;
  className?: string;
}

export function Avatar({ user, size = "md", showRing = false, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const { img, class: sizeClass, text: textClass } = SIZE_MAP[size];
  const levelConfig = AURA_LEVELS[user.level];

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 overflow-hidden",
        showRing && `ring-2 ring-offset-2 ring-offset-background ${levelConfig.ringClass}`,
        sizeClass,
        className
      )}
    >
      {user.avatarUrl && !imgError ? (
        <Image
          src={user.avatarUrl}
          alt={user.displayName}
          width={img}
          height={img}
          className="rounded-full object-cover w-full h-full"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={cn("w-full h-full bg-brand/20 flex items-center justify-center font-black text-brand", textClass)}>
          {user.displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
