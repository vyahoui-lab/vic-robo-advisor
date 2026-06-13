"use client";
import { createContext, useContext, useState } from "react";
import type { ToggleState } from "./types";

const DEFAULT: ToggleState = { exclusion: true, literacy: true, opacity: true, surveillance: true };

type Ctx = {
  toggles: ToggleState;
  setToggle: (k: keyof ToggleState, v: boolean) => void;
  reset: () => void;
};

const ToggleContext = createContext<Ctx | null>(null);

export function ToggleProvider({ children }: { children: React.ReactNode }) {
  const [toggles, setToggles] = useState<ToggleState>(DEFAULT);
  const setToggle = (k: keyof ToggleState, v: boolean) => setToggles(prev => ({ ...prev, [k]: v }));
  const reset = () => setToggles(DEFAULT);
  return <ToggleContext.Provider value={{ toggles, setToggle, reset }}>{children}</ToggleContext.Provider>;
}

export function useToggles() {
  const ctx = useContext(ToggleContext);
  if (!ctx) throw new Error("useToggles outside ToggleProvider");
  return ctx;
}
