import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLayout } from "@/context/LayoutContext";
import LayoutToggle from "./LayoutToggle";
import Navbar from "./Navbar";

interface SymposLayoutProps {
  children: ReactNode;
}

const SymposLayout = ({ children }: SymposLayoutProps) => {
  const { layoutMode, colorMode } = useLayout();

  if (layoutMode !== "sympos") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Use same Navbar as default but with Sympos layout */}
      <Navbar />
      
      {/* Main Content with Sympos Layout Structure */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default SymposLayout;
