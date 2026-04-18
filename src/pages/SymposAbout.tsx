import { motion } from "framer-motion";
import SymposLayout from "@/components/SymposLayout";
import {
  SymposHero,
  SymposJoin,
  SymposImpact,
  SymposCTA,
} from "@/components/SymposSections";

const SymposAbout = () => {
  return (
    <SymposLayout>
      <SymposHero />
      <SymposJoin />
      <SymposImpact />
      <SymposCTA />
    </SymposLayout>
  );
};

export default SymposAbout;