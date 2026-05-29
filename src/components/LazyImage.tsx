import { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage = ({ src, alt, className, placeholder }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }
  }, [src]);

  if (error) {
    return (
      <div className={className}>
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Image failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!loaded && (
        <div className="w-full h-full bg-muted animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={loaded ? "w-full h-full object-cover" : "hidden"}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default LazyImage;