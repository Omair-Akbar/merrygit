'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer relative inline-flex h-[1.5rem] w-[2.3rem] shrink-0 items-center rounded-full border border-transparent shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        // Light theme states
        'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600',
        'data-[state=unchecked]:bg-gray-200',
        // Dark theme states
        'dark:data-[state=checked]:bg-gradient-to-r dark:data-[state=checked]:from-purple-500 dark:data-[state=checked]:to-indigo-500',
        'dark:data-[state=unchecked]:bg-gray-700',
        // Hover effects
        'hover:shadow-md transition-shadow duration-200',
        // Optional glow effect on dark mode
        'dark:data-[state=checked]:shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-4 rounded-full shadow-sm transition-all duration-200',
          // Light theme thumb
          'bg-white',
          // Dark theme thumb
          'dark:bg-gray-100',
          // Transform based on state
          'data-[state=checked]:translate-x-[calc(100%)] data-[state=unchecked]:translate-x-1',
          // Animation for smooth movement
          'will-change-transform',
          // Optional: add subtle glow to thumb in dark mode when checked
          'dark:data-[state=checked]:shadow-[0_0_5px_rgba(255,255,255,0.5)]',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }