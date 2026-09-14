import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RouteSEO from "./RouteSEO";
import CinematicChrome from "@/components/cinematic/CinematicChrome";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[130] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded"
      >
        Skip to main content
      </a>
      <RouteSEO />
      <CinematicChrome />
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
