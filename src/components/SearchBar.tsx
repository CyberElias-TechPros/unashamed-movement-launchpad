import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  type: "testimony" | "resource" | "product" | "event";
  title: string;
  description: string;
  url: string;
}

interface SearchProps {
  results?: SearchResult[];
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ results = [], onSearch }: SearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search testimonies, resources, products..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-12"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
          >
            {results.map((result) => (
              <motion.a
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                href={result.url}
                className="block p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                onClick={clearSearch}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="bg-accent/10 px-2 py-0.5 rounded-full">
                    {result.type}
                  </span>
                </div>
                <p className="font-heading text-sm tracking-wider">{result.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {result.description}
                </p>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};