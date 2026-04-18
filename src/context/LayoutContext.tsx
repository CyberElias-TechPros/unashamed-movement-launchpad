import { createContext, useContext, useState, ReactNode } from "react";

type LayoutMode = "current" | "sympos";
type ColorMode = "original" | "bw-purple";

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("current");
  const [colorMode, setColorMode] = useState<ColorMode>("original");
  return (
    <LayoutContext.Provider value={{ layoutMode, setLayoutMode, colorMode, setColorMode }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within LayoutProvider");
  return context;
};