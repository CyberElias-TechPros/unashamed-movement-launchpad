import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { countriesApi } from "@/api/countries";

interface CountryData {
  code: string;
  name: string;
  preachers: number;
  color: string;
}

const COLORS = [
  "bg-blue-500", "bg-blue-600", "bg-blue-400", "bg-blue-300",
  "bg-green-500", "bg-green-400", "bg-green-600", "bg-green-700",
  "bg-purple-400", "bg-red-500", "bg-red-400", "bg-red-600",
  "bg-yellow-500", "bg-yellow-600", "bg-purple-500", "bg-purple-600",
];

const FALLBACK: CountryData[] = [
  { code: "CA", name: "Canada", preachers: 8, color: "bg-blue-500" },
  { code: "US", name: "United States", preachers: 15, color: "bg-blue-600" },
  { code: "GB", name: "United Kingdom", preachers: 12, color: "bg-blue-400" },
  { code: "NG", name: "Nigeria", preachers: 18, color: "bg-green-500" },
];

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
    <div className="w-full h-full relative min-h-[280px]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 p-6 h-full">
          {countries.map((country) => {
            const opacity = country.preachers / maxPreachers;
            return (
              <motion.div
                key={country.code}
                className={`relative rounded-lg cursor-pointer transition-all duration-300 ${country.color}/30`}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => setHoveredCountry(country)}
                onHoverEnd={() => setHoveredCountry(null)}
                onClick={() => handleSelect(country)}
                style={{ opacity: 0.6 + opacity * 0.4 }}
                role="button"
                tabIndex={0}
                aria-label={`${country.name}, ${country.preachers} preachers`}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(country)}
              >
                <div className="aspect-square flex items-center justify-center">
                  <span className="text-[10px] font-bold text-foreground">{country.code}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {hoveredCountry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <div>
              <p className="font-heading text-sm">{hoveredCountry.name}</p>
              <p className="text-xs text-muted-foreground">
                {hoveredCountry.preachers} preacher{hoveredCountry.preachers !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {selectedCountry && !onCountrySelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-foreground/60 flex items-center justify-center p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-xl tracking-wider mb-4">{selectedCountry.name}</h3>
            <p className="text-muted-foreground mb-4">{selectedCountry.preachers} active preachers</p>
            <button type="button" className="text-sm text-accent hover:underline" onClick={() => setSelectedCountry(null)}>
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveWorldMap;
