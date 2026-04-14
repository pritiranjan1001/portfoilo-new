"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

export const LenisInstanceContext = createContext<Lenis | null>(null);

export function useLenisInstance(): Lenis | null {
  return useContext(LenisInstanceContext);
}
