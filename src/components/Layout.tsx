import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RouteSEO from "./RouteSEO";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <RouteSEO />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
