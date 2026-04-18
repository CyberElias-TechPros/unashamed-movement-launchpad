import SymposLayout from "@/components/SymposLayout";
import {
  SymposHero,
  SymposJoin,
  SymposLineup,
  SymposImpact,
  SymposRundown,
  SymposEvent,
  SymposPricing,
  SymposTestimonials,
  SymposCTA,
} from "@/components/SymposSections";

const SymposIndex = () => {
  return (
    <SymposLayout>
      <SymposHero />
      <SymposJoin />
      <SymposLineup />
      <SymposImpact />
      <SymposRundown />
      <SymposEvent />
      <SymposPricing />
      <SymposTestimonials />
      <SymposCTA />
    </SymposLayout>
  );
};

export default SymposIndex;
