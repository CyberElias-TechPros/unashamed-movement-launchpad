import { useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { pageSeoMap, DEFAULT_SITE_URL } from "@/config/pageSeo";

export const RouteSEO = () => {
  const { pathname } = useLocation();
  const meta = pageSeoMap[pathname] || {
    title: "The Time Is Now",
    description: "A faith-based movement inspiring Christians to live boldly.",
  };

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      url={`${DEFAULT_SITE_URL}${pathname}`}
    />
  );
};

export default RouteSEO;
