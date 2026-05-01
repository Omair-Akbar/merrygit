"use client";

import { useAppSelector } from "@/lib/store/hooks";
import GlobalLoader from "./GlobalLoader";

export function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
}
