"use client";

import Image from "next/image";

export default function GlobalLoader() {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-white
        dark:bg-black
      "
    >
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring with gradient */}
        <div
          className="
            absolute
            h-40 w-40
            animate-spin
            rounded-full
            bg-black
            dark:bg-white
            opacity-10
            blur-sm
          "
          style={{ animationDuration: "3s" }}
        />

        {/* Middle rotating ring */}
        <div
          className="
            absolute
            h-36 w-36
            animate-spin
            rounded-full
            border-4
            border-transparent
            border-t-black
            border-r-black
            dark:border-t-white
            dark:border-r-white
          "
          style={{ animationDuration: "2s" }}
        />

        {/* Inner counter-rotating ring */}
        <div
          className="
            absolute
            h-32 w-32
            rounded-full
            border-4
            border-transparent
            border-b-neutral-800
            border-l-neutral-700
            dark:border-b-neutral-200
            dark:border-l-neutral-300
            opacity-60
          "
          style={{ 
            animation: "spin 1.5s linear infinite reverse"
          }}
        />

        {/* Pulsing glow effect */}
        <div
          className="
            absolute
            h-28 w-28
            animate-pulse
            rounded-full
            bg-neutral-900
            dark:bg-neutral-100
            opacity-5
            blur-xl
          "
        />

        {/* Logo container with subtle animation */}
        <div 
          className="relative z-10 animate-pulse"
          style={{ animationDuration: "2s" }}
        >
          {/* Light theme logo */}
          <Image
            src="/logo-light.png"
            alt="Logo"
            width={72}
            height={72}
            className="block dark:hidden drop-shadow-lg"
            priority
          />

          {/* Dark theme logo */}
          <Image
            src="/logo-dark.png"
            alt="Logo"
            width={72}
            height={72}
            className="hidden dark:block drop-shadow-lg"
            priority
          />
        </div>

        {/* Orbiting dots */}
        <div
          className="absolute h-44 w-44 animate-spin"
          style={{ animationDuration: "4s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-black dark:bg-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-neutral-800 dark:bg-neutral-200" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-neutral-700 dark:bg-neutral-300" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-neutral-600 dark:bg-neutral-400" />
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-1/3 flex items-center gap-1">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 animate-pulse">
          Loading
        </span>
        <span className="flex gap-1">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </div>
    </div>
  );
}
