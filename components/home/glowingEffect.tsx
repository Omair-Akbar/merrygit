"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  glow?: boolean;
  className?: string;
  variant?: "default" | "white";
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export const GlowingEffect = ({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  glow = false,
  className,
  variant = "default",
  disabled = true,
  movementDuration = 2,
  borderWidth = 1,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || disabled) return;

      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (
        mouseX < left - proximity ||
        mouseX > left + width + proximity ||
        mouseY < top - proximity ||
        mouseY > top + height + proximity
      ) {
        containerRef.current.style.setProperty("--active", "0");
        return;
      }

      const relX = mouseX - left;
      const relY = mouseY - top;

      const centerX = width / 2;
      const centerY = height / 2;

      const distance = Math.sqrt(
        Math.pow(relX - centerX, 2) + Math.pow(relY - centerY, 2)
      );
      const maxDistance = Math.sqrt(
        Math.pow(centerX, 2) + Math.pow(centerY, 2)
      );

      const inactiveRadius = maxDistance * inactiveZone;

      if (distance < inactiveRadius) {
        containerRef.current.style.setProperty("--active", "0");
        return;
      }

      const angle = Math.atan2(relY - centerY, relX - centerX);
      const angleDeg = ((angle * 180) / Math.PI + 360) % 360;

      containerRef.current.style.setProperty("--active", "1");
      containerRef.current.style.setProperty("--start", `${angleDeg}`);
    },
    [disabled, inactiveZone, proximity]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <>
      <style>{`
        @property --start {
          syntax: "<angle>";
          inherits: true;
          initial-value: 0deg;
        }
        
        .glowing-effect-container {
          --active: 0;
          --start: 0deg;
        }

        .glowing-effect-border {
          background: conic-gradient(
            from calc(var(--start) * 1deg),
            transparent 0%,
            hsl(var(--start), 100%, 60%) calc(var(--spread) * 1%),
            transparent calc(var(--spread) * 1%)
          );
          opacity: var(--active);
          transition: opacity ${movementDuration}s ease;
        }

        .glowing-effect-container.glow-active .glowing-effect-border {
          filter: blur(${blur}px);
        }
      `}</style>
      <div
        ref={containerRef}
        style={
          {
            "--spread": spread,
            "--blur": blur,
            "--border-width": borderWidth,
          } as React.CSSProperties
        }
        className={cn(
          "glowing-effect-container pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
          glow && "glow-active",
          className
        )}
      >
        <div
          className={cn(
            "glowing-effect-border absolute inset-0 rounded-[inherit]",
            variant === "white" ? "opacity-20" : "opacity-100"
          )}
          style={{
            padding: `${borderWidth}px`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            background:
              variant === "white"
                ? `conic-gradient(from calc(var(--start) * 1deg), transparent 0%, white calc(${spread} * 1%), transparent calc(${spread} * 1%))`
                : `conic-gradient(from calc(var(--start) * 1deg), transparent 0%, #6366f1 calc(${spread} * 1%), transparent calc(${spread} * 1%))`,
            opacity: "var(--active, 0)",
            transition: `opacity ${movementDuration}s ease`,
          }}
        />
      </div>
    </>
  );
};