import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { countriesApi } from "@/api/countries";

interface CountryData {
  code: string;
  name: string;
  preachers: number;
  color: string;
  flag: string;
}

const COLORS = [
  "bg-blue-500", "bg-blue-600", "bg-blue-400", "bg-blue-300",
  "bg-green-500", "bg-green-400", "bg-green-600", "bg-green-700",
  "bg-purple-400", "bg-red-500", "bg-red-400", "bg-red-600",
  "bg-yellow-500", "bg-yellow-600", "bg-purple-500", "bg-purple-600",
];

const FLAG_BY_CODE: Record<string, string> = {
  AU: "🇦🇺",
  BI: "🇧🇮",
  CA: "🇨🇦",
  CM: "🇨🇲",
  ES: "🇪🇸",
  GH: "🇬🇭",
  HU: "🇭🇺",
  ID: "🇮🇩",
  IL: "🇮🇱",
  IN: "🇮🇳",
  KE: "🇰🇪",
  NG: "🇳🇬",
  PL: "🇵🇱",
  SZ: "🇸🇿",
  US: "🇺🇸",
  GB: "🇬🇧",
};

const FALLBACK: CountryData[] = [
  { code: "CA", name: "Canada", preachers: 8, color: "bg-blue-500", flag: "🇨🇦" },
  { code: "US", name: "United States", preachers: 15, color: "bg-blue-600", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", preachers: 12, color: "bg-blue-400", flag: "🇬🇧" },
  { code: "AU", name: "Australia", preachers: 6, color: "bg-green-500", flag: "🇦🇺" },
  { code: "NG", name: "Nigeria", preachers: 18, color: "bg-green-600", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", preachers: 10, color: "bg-green-400", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", preachers: 9, color: "bg-green-700", flag: "🇰🇪" },
  { code: "IN", name: "India", preachers: 11, color: "bg-purple-400", flag: "🇮🇳" },
  { code: "ES", name: "Spain", preachers: 5, color: "bg-yellow-500", flag: "🇪🇸" },
  { code: "IL", name: "Israel", preachers: 5, color: "bg-red-400", flag: "🇮🇱" },
  { code: "ID", name: "Indonesia", preachers: 7, color: "bg-red-500", flag: "🇮🇩" },
  { code: "HU", name: "Hungary", preachers: 4, color: "bg-purple-500", flag: "🇭🇺" },
  { code: "PL", name: "Poland", preachers: 3, color: "bg-purple-600", flag: "🇵🇱" },
  { code: "CM", name: "Cameroon", preachers: 4, color: "bg-blue-300", flag: "🇨🇲" },
  { code: "BI", name: "Burundi", preachers: 2, color: "bg-yellow-600", flag: "🇧🇮" },
  { code: "SZ", name: "Eswatini", preachers: 3, color: "bg-red-600", flag: "🇸🇿" },
];

const countryCodeToFlag = (code: string) => FLAG_BY_CODE[code] || "🌍";

interface WorldMapProps {
  onCountrySelect?: (code: string, name: string) => void;
}

const InteractiveWorldMap = ({ onCountrySelect }: WorldMapProps) => {
  const [countries, setCountries] = useState<CountryData[]>(FALLBACK);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  useEffect(() => {
    countriesApi
      .getAll()
      .then((data) =>
        setCountries(
          data.map((c, i) => ({
            ...c,
            color: COLORS[i % COLORS.length],
            flag: countryCodeToFlag(c.code),
          }))
        )
      )
      .catch(() => setCountries(FALLBACK));
  }, []);

  const maxPreachers = Math.max(...countries.map((c) => c.preachers), 1);

  const handleSelect = (country: CountryData) => {
    setSelectedCountry(country);
    onCountrySelect?.(country.code, country.name);
  };

  return (
    <div className="w-full h-full relative min-h-[320px]">
      <div className="absolute inset-0 rounded-3xl border border-border/70 bg-card/45 shadow-2xl shadow-primary/10 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.04]" />
        <div className="relative grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2.5 p-4 sm:p-6 h-full">
          {countries.map((country) => {
            const opacity = country.preachers / maxPreachers;
            return (
              <motion.div
                key={country.code}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-sm backdrop-blur ${country.color}/25`}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onHoverStart={() => setHoveredCountry(country)}
                onHoverEnd={() => setHoveredCountry(null)}
                onClick={() => handleSelect(country)}
                style={{ opacity: 0.72 + opacity * 0.28 }}
                role="button"
                tabIndex={0}
                aria-label={`${country.flag} ${country.name}, ${country.preachers} preachers`}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(country)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-foreground/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-accent/15 blur-xl transition-all duration-300 group-hover:bg-accent/25" />
                <div className="relative flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
                  <span className="text-2xl sm:text-3xl drop-shadow-sm">{country.flag}</span>
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/80">
                    {country.code}
                  </span>
                  <span className="max-w-[92%] truncate font-sans text-[10.5px] font-medium leading-tight text-muted-foreground">
                    {country.name}
                  </span>
                  <span className="mt-1 rounded-full bg-foreground/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-foreground/80">
                    {country.preachers}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {hoveredCountry && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-4 left-4 z-20 bg-card/95 border border-border rounded-2xl px-4 py-3 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{hoveredCountry.flag}</span>
            <div>
              <p className="font-sans text-sm font-semibold tracking-tight text-foreground">{hoveredCountry.name}</p>
              <p className="font-sans text-xs text-muted-foreground">
                {hoveredCountry.preachers} active preacher{hoveredCountry.preachers !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {selectedCountry && !onCountrySelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 bg-foreground/65 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="text-5xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground">{selectedCountry.name}</h3>
                <p className="font-sans text-sm text-muted-foreground">{selectedCountry.code}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4 mb-5">
              <p className="font-sans text-sm text-muted-foreground mb-1">Active preachers</p>
              <p className="font-sans text-3xl font-bold tracking-tight text-accent">{selectedCountry.preachers}</p>
            </div>
            <button type="button" className="font-sans text-sm font-semibold text-accent hover:underline" onClick={() => setSelectedCountry(null)}>
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveWorldMap;
