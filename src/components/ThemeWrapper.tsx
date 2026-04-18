import { useEffect } from "react";
import { useLayout } from "@/context/LayoutContext";

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { colorMode } = useLayout();

  useEffect(() => {
    if (colorMode === "bw-purple") {
      document.documentElement.classList.add("bw-purple-theme");
    } else {
      document.documentElement.classList.remove("bw-purple-theme");
    }
  }, [colorMode]);

  return <>{children}</>;
};

export default ThemeWrapper;